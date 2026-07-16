import { fromReadable, lines } from '../src'

async function* mockBytes(...chunks: (string | Uint8Array)[]): AsyncGenerator<string | Uint8Array> {
  for (const c of chunks) yield c
}

describe('fromReadable', () => {
  it('decodes byte chunks as UTF-8 strings by default', async () => {
    const enc = new TextEncoder()
    const out = await fromReadable(mockBytes(enc.encode('hello '), enc.encode('world'))).toArray()
    expect(out.join('')).toBe('hello world')
  })

  it('passes through string chunks unchanged', async () => {
    const out = await fromReadable(mockBytes('a', 'b', 'c')).toArray()
    expect(out).toEqual(['a', 'b', 'c'])
  })

  it('handles multibyte characters split across chunks', async () => {
    const enc = new TextEncoder()
    const bytes = enc.encode('héllo')
    // Split inside the multibyte é (bytes 1 and 2)
    const out = await fromReadable(mockBytes(bytes.slice(0, 2), bytes.slice(2))).toArray()
    expect(out.join('')).toBe('héllo')
  })
})

describe('lines', () => {
  it('emits lines split on \\n', async () => {
    const out: string[] = []
    for await (const line of lines(mockBytes('a\nb\nc'))) out.push(line)
    expect(out).toEqual(['a', 'b', 'c'])
  })

  it('handles \\r\\n', async () => {
    const out: string[] = []
    for await (const line of lines(mockBytes('a\r\nb\r\n'))) out.push(line)
    expect(out).toEqual(['a', 'b'])
  })

  it('handles lines spanning multiple chunks', async () => {
    const out: string[] = []
    for await (const line of lines(mockBytes('hel', 'lo\nwor', 'ld\n'))) out.push(line)
    expect(out).toEqual(['hello', 'world'])
  })

  it('emits the trailing line without newline', async () => {
    const out: string[] = []
    for await (const line of lines(mockBytes('a\nbtail'))) out.push(line)
    expect(out).toEqual(['a', 'btail'])
  })
})
