import { UsageSchema, type RequestSpeedSample } from './core/index.js'

export interface ModelRequest {
  provider: string
  model: string
}

export interface ModelChunk {
  type: string
  text?: string
  argumentsDelta?: string
  usage?: unknown
}

/** Pass through the exact chunks and backpressure; record only route, usage and timings. */
export async function* observeRequest(
  request: ModelRequest,
  next: () => AsyncIterable<ModelChunk>,
  record: (row: RequestSpeedSample) => void,
  now: () => number = () => performance.now(),
  startedAt: () => number = Date.now,
): AsyncIterable<ModelChunk> {
  const time = startedAt()
  const start = now()
  let first: number | null = null
  let last: number | null = null
  let outputTokens: number | null = null
  try {
    for await (const chunk of next()) {
      if (chunk.type === 'usage') {
        const parsed = UsageSchema.safeParse(chunk.usage)
        if (parsed.success && parsed.data.outputTokens !== undefined) outputTokens = parsed.data.outputTokens
      } else if (
        ((chunk.type === 'text-delta' || chunk.type === 'reasoning-delta') && chunk.text) ||
        (chunk.type === 'tool-call-delta' && chunk.argumentsDelta)
      ) {
        last = now()
        first ??= last
      }
      yield chunk
    }
  } finally {
    record({
      time,
      provider: request.provider,
      model: request.model,
      ttftMs: first === null ? null : first - start,
      generationMs: first === null || last === null || last <= first ? null : last - first,
      outputTokens,
    })
  }
}
