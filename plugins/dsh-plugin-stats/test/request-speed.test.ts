import { describe, expect, it } from 'vitest'
import { summarizeSpeed, type RequestSpeedSample } from '../src/core/index.js'
import { observeRequest, type ModelChunk } from '../src/request-observer.js'

const hour = 3_600_000
const now = 100 * hour
const request = (changes: Partial<RequestSpeedSample> = {}): RequestSpeedSample => ({
  time: now - 1000, model: 'model', provider: 'a', ttftMs: 1000, generationMs: 1000, outputTokens: 100, ...changes,
})

describe('request-level model speed', () => {
  it('groups provider/model and uses complete matched samples for the ratio of sums', () => {
    const { rows } = summarizeSpeed([
      request(), request({ ttftMs: 3000, generationMs: 3000, outputTokens: 90 }),
      request({ ttftMs: 2000, outputTokens: null }), request({ ttftMs: null, outputTokens: 500 }),
      request({ provider: 'b', ttftMs: null, generationMs: null, outputTokens: null }),
    ], 1, now)
    expect(rows).toEqual([
      { provider: 'a', model: 'model', requests: 4, outputTokens: 690, ttftSamples: 3, tpsSamples: 2,
        ttftMs: 2000, generationTps: 47.5, endToEndTps: 23.75 },
      { provider: 'b', model: 'model', requests: 1, outputTokens: null, ttftSamples: 0, tpsSamples: 0,
        ttftMs: null, generationTps: null, endToEndTps: null },
    ])
  })

  it('uses rolling request-start windows with exact cutoffs', () => {
    const rows = [request({ time: now - hour }), request({ time: now - hour - 1 }),
      request({ time: now - 12 * hour - 1 }), request({ time: now - 24 * hour - 1 }), request({ time: now + 1 })]
    expect([1, 12, 24].map((hours) => summarizeSpeed(rows, hours as 1 | 12 | 24, now).rows[0]?.requests)).toEqual([1, 2, 3])
  })

  it('starts from the actual request and ignores empty chunks, usage and finish for timing', async () => {
    const input: [number, ModelChunk][] = [
      [20, { type: 'block-start' }], [30, { type: 'text-delta', text: '' }],
      [200, { type: 'reasoning-delta', text: 'reason' }],
      [500, { type: 'text-delta', text: 'answer' }],
      [800, { type: 'tool-call-delta', argumentsDelta: '{}' }],
      [1000, { type: 'usage', usage: { outputTokens: 60 } }], [1100, { type: 'finish' }],
    ]
    let monotonic = 10
    const samples: RequestSpeedSample[] = []
    const received: ModelChunk[] = []
    const upstream = async function* () {
      for (const [time, chunk] of input) { monotonic = time; yield chunk }
    }
    for await (const chunk of observeRequest({ provider: 'proxy', model: 'test' }, upstream,
      (sample) => samples.push(sample), () => monotonic, () => now)) received.push(chunk)
    expect(received).toEqual(input.map(([, chunk]) => chunk))
    expect(samples).toEqual([{ time: now, provider: 'proxy', model: 'test', ttftMs: 190, generationMs: 600, outputTokens: 60 }])
  })

  it('records a first token but no generation duration for a single content batch', async () => {
    let monotonic = 0
    const upstream = async function* () {
      monotonic = 50
      yield { type: 'tool-call-delta', argumentsDelta: '{}' }
      yield { type: 'usage', usage: { outputTokens: 40 } }
    }
    const samples: RequestSpeedSample[] = []
    for await (const _ of observeRequest({ provider: 'a', model: 'model' }, upstream,
      (sample) => samples.push(sample), () => monotonic, () => now)) { /* drain */ }
    expect(samples).toEqual([request({ time: now, ttftMs: 50, generationMs: null, outputTokens: 40 })])
  })
})
