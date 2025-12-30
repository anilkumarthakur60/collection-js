/**
 * Parse newline-delimited JSON. Empty lines are skipped. Each line must be
 * a complete JSON value; otherwise a SyntaxError is thrown with the line
 * number for diagnostics.
 */
export function parseJsonl<T = unknown>(input: string): T[] {
  const out: T[] = []
  const lines = input.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() === '') continue
    try {
      out.push(JSON.parse(line) as T)
    } catch (err) {
      throw new SyntaxError(`parseJsonl: invalid JSON on line ${i + 1}: ${(err as Error).message}`)
    }
  }
  return out
}

export function toJsonl<T>(items: ReadonlyArray<T>, eol: string = '\n'): string {
  return items.map((item) => JSON.stringify(item)).join(eol)
}

/** Parse a JSONL stream incrementally, yielding one object per line. */
export async function* parseJsonlStream<T = unknown>(source: AsyncIterable<string>): AsyncGenerator<T> {
  let buffer = ''
  let lineNo = 0
  for await (const chunk of source) {
    buffer += chunk
    let idx: number
    while ((idx = buffer.indexOf('\n')) >= 0) {
      lineNo++
      const line = buffer.slice(0, idx).replace(/\r$/, '')
      buffer = buffer.slice(idx + 1)
      if (line.trim() === '') continue
      try {
        yield JSON.parse(line) as T
      } catch (err) {
        throw new SyntaxError(`parseJsonlStream: invalid JSON on line ${lineNo}: ${(err as Error).message}`)
      }
    }
  }
  if (buffer.trim() !== '') {
    lineNo++
    try {
      yield JSON.parse(buffer) as T
    } catch (err) {
      throw new SyntaxError(`parseJsonlStream: invalid JSON on line ${lineNo}: ${(err as Error).message}`)
    }
  }
}
