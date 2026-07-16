import { parseJsonl, parseJsonlStream, toJsonl } from '../src'

describe('parseJsonl', () => {
  it('parses one object per line', () => {
    expect(parseJsonl('{"a":1}\n{"a":2}\n{"a":3}')).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }])
  })

  it('skips empty lines', () => {
    expect(parseJsonl('{"a":1}\n\n{"a":2}\n')).toEqual([{ a: 1 }, { a: 2 }])
  })

  it('returns empty for empty input', () => {
    expect(parseJsonl('')).toEqual([])
  })

  it('throws SyntaxError on bad JSON, with cause attached', () => {
    let caught: Error | undefined
    try {
      parseJsonl('{"a":1}\n{not json}')
    } catch (e) {
      caught = e as Error
    }
    expect(caught).toBeInstanceOf(SyntaxError)
    expect(caught?.message).toContain('line 2')
    expect((caught as { cause?: unknown }).cause).toBeDefined()
  })

  it('handles CRLF line endings', () => {
    expect(parseJsonl('{"a":1}\r\n{"a":2}\r\n')).toEqual([{ a: 1 }, { a: 2 }])
  })
})

describe('toJsonl', () => {
  it('serialises one object per line', () => {
    expect(toJsonl([{ a: 1 }, { a: 2 }])).toBe('{"a":1}\n{"a":2}')
  })

  it('honours a custom EOL', () => {
    expect(toJsonl([{ a: 1 }, { a: 2 }], '\r\n')).toBe('{"a":1}\r\n{"a":2}')
  })

  it('returns empty for empty input', () => {
    expect(toJsonl([])).toBe('')
  })
})

describe('parseJsonlStream', () => {
  async function* mockChunks(...chunks: string[]): AsyncGenerator<string> {
    for (const c of chunks) yield c
  }

  it('yields parsed objects across chunk boundaries', async () => {
    const out = []
    for await (const item of parseJsonlStream(mockChunks('{"a":1}\n{"a":', '2}\n{"a":3}'))) {
      out.push(item)
    }
    expect(out).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }])
  })

  it('throws with line context on invalid JSON', async () => {
    const it = parseJsonlStream(mockChunks('{"a":1}\nbad\n'))
    let caught: Error | undefined
    try {
      for await (const _ of it) void _
    } catch (e) {
      caught = e as Error
    }
    expect(caught).toBeInstanceOf(SyntaxError)
    expect(caught?.message).toContain('line 2')
  })

  async function drain<T>(source: AsyncGenerator<T>): Promise<T[]> {
    const out: T[] = []
    for await (const item of source) out.push(item)
    return out
  }

  it('handles one JSON value split across many chunks', async () => {
    const out = await drain(parseJsonlStream(mockChunks('{"a', '":', '42}\n{"b":true}')))
    expect(out).toEqual([{ a: 42 }, { b: true }])
  })

  it('handles a chunk split inside a string value', async () => {
    const out = await drain(parseJsonlStream(mockChunks('{"msg":"hel', 'lo, world"}\n')))
    expect(out).toEqual([{ msg: 'hello, world' }])
  })

  it('handles CRLF split across chunks', async () => {
    const out = await drain(parseJsonlStream(mockChunks('{"a":1}\r', '\n{"a":2}')))
    expect(out).toEqual([{ a: 1 }, { a: 2 }])
  })

  it('handles a newline exactly at a chunk boundary', async () => {
    const out = await drain(parseJsonlStream(mockChunks('{"a":1}\n', '{"a":2}\n')))
    expect(out).toEqual([{ a: 1 }, { a: 2 }])
  })

  it('flushes a trailing value that has no final newline', async () => {
    const out = await drain(parseJsonlStream(mockChunks('{"a":1}\n{"a":', '2}')))
    expect(out).toEqual([{ a: 1 }, { a: 2 }])
  })

  it('ignores empty and whitespace-only chunks/lines', async () => {
    const out = await drain(parseJsonlStream(mockChunks('', '{"a":1}\n \n', '', '\n{"a":2}\n')))
    expect(out).toEqual([{ a: 1 }, { a: 2 }])
  })

  it('yields nothing for an empty stream', async () => {
    expect(await drain(parseJsonlStream(mockChunks()))).toEqual([])
  })

  it('reports the correct line number when the invalid JSON is the unterminated tail', async () => {
    const it = parseJsonlStream(mockChunks('{"a":1}\n{"a":2}\n', 'nope'))
    let caught: Error | undefined
    try {
      for await (const _ of it) void _
    } catch (e) {
      caught = e as Error
    }
    expect(caught).toBeInstanceOf(SyntaxError)
    expect(caught?.message).toContain('line 3')
    expect((caught as { cause?: unknown } | undefined)?.cause).toBeDefined()
  })
})
