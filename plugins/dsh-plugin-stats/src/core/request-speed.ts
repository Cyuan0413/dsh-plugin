import { z } from 'zod'

export const SPEED_WINDOWS = [1, 12, 24] as const
export type SpeedWindow = (typeof SPEED_WINDOWS)[number]

const GENERATION_DECODE_FLOOR_MS = 2_000

const count = z.number().int().nonnegative()
const duration = z.number().nonnegative().nullable()
const RequestSpeedSampleSchema = z.object({
  time: z.number(),
  provider: z.string(),
  model: z.string(),
  ttftMs: duration,
  generationMs: duration,
  outputTokens: count.nullable(),
})
export type RequestSpeedSample = z.infer<typeof RequestSpeedSampleSchema>

export function parseRequestSpeedLine(line: string): RequestSpeedSample | null {
  try {
    const parsed = RequestSpeedSampleSchema.safeParse(JSON.parse(line))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

const SpeedRowSchema = z.object({
  provider: z.string(),
  model: z.string(),
  requests: count,
  outputTokens: count.nullable(),
  ttftSamples: count,
  generationSamples: count,
  tpsSamples: count, // Preserved wire field for end-to-end samples.
  ttftMs: duration,
  generationTps: duration,
  endToEndTps: duration,
})
export type SpeedRow = z.infer<typeof SpeedRowSchema>
export const SpeedSummarySchema = z.object({ asOf: z.number(), rows: z.array(SpeedRowSchema) })
export type SpeedSummary = z.infer<typeof SpeedSummarySchema>

interface Bucket {
  row: SpeedRow
  ttftMs: number
  generationMs: number
  generationOutputTokens: number
  endToEndMs: number
  endToEndOutputTokens: number
}

/** Each rate divides the sum of tokens by the sum of times from its own samples. */
export function summarizeSpeed(samples: readonly RequestSpeedSample[], hours: SpeedWindow, asOf: number): SpeedSummary {
  const from = asOf - hours * 3_600_000
  const buckets = new Map<string, Bucket>()
  for (const { time, provider, model, ttftMs, generationMs, outputTokens } of samples) {
    if (time < from || time > asOf) continue
    const key = JSON.stringify([provider, model])
    let bucket = buckets.get(key)
    if (bucket === undefined) {
      bucket = {
        row: { provider, model, requests: 0, outputTokens: null, ttftSamples: 0, generationSamples: 0, tpsSamples: 0,
          ttftMs: null, generationTps: null, endToEndTps: null },
        ttftMs: 0, generationMs: 0, generationOutputTokens: 0, endToEndMs: 0, endToEndOutputTokens: 0,
      }
      buckets.set(key, bucket)
    }
    const { row } = bucket
    row.requests++
    if (outputTokens !== null) row.outputTokens = (row.outputTokens ?? 0) + outputTokens
    if (ttftMs !== null) {
      row.ttftSamples++
      bucket.ttftMs += ttftMs
    }
    if (ttftMs !== null && generationMs !== null && generationMs > 0 && outputTokens !== null) {
      row.tpsSamples++
      bucket.endToEndOutputTokens += outputTokens
      bucket.endToEndMs += ttftMs + generationMs
      if (generationMs > GENERATION_DECODE_FLOOR_MS) {
        row.generationSamples++
        bucket.generationOutputTokens += outputTokens
        bucket.generationMs += generationMs
      }
    }
  }
  return {
    asOf,
    rows: [...buckets.values()].map(({ row, ttftMs, generationOutputTokens, generationMs, endToEndOutputTokens, endToEndMs }) => ({
      ...row,
      ttftMs: row.ttftSamples === 0 ? null : ttftMs / row.ttftSamples,
      generationTps: row.generationSamples === 0 ? null : generationOutputTokens * 1000 / generationMs,
      endToEndTps: row.tpsSamples === 0 ? null : endToEndOutputTokens * 1000 / endToEndMs,
    })),
  }
}
