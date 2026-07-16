import { collect, lazy, parseCsv, toCsv, fromReadable, lines } from '../src'

async function* mockBytes(...chunks: (string | Uint8Array)[]): AsyncGenerator<string | Uint8Array> {
  for (const c of chunks) yield c
}

describe('unicode and emoji handling (audit: zero unicode tests outside streams)', () => {
  it('whereLike % wildcard matches emoji and combining characters', () => {
    const rows = [{ v: 'hi 👍 there' }, { v: 'plain' }]
    expect(collect(rows).whereLike('v', '%👍%').pluck('v').all()).toEqual(['hi 👍 there'])
  })

  it('whereLike _ matches one UTF-16 code unit: an astral emoji needs two (documented)', () => {
    const rows = [{ v: '😀' }, { v: 'x' }]
    // '😀' is a surrogate pair (2 code units) — a single '_' does not match it…
    expect(collect(rows).whereLike('v', '_').pluck('v').all()).toEqual(['x'])
    // …but two underscores do. This pins the current code-unit semantics.
    expect(collect(rows).whereLike('v', '__').pluck('v').all()).toEqual(['😀'])
  })

  it('implode/join keep emoji and CJK intact', () => {
    expect(collect(['héllo', '👍', '中文']).implode('|')).toBe('héllo|👍|中文')
    expect(collect(['α', 'β', 'γ']).join(', ', ' και ')).toBe('α, β και γ')
  })

  it('flip and countBy accept unicode keys', () => {
    expect(collect(['é', '😀']).flip().first()).toEqual({ é: 0, '😀': 1 })
    expect(collect(['😀', '😀', 'é']).countBy()).toEqual({ '😀': 2, é: 1 })
  })

  it('CSV round-trips emoji, accents, and CJK', () => {
    const rows = [{ name: 'héllo 👍中', note: 'ok' }]
    const csv = toCsv(rows)
    expect(parseCsv(csv, { header: true })).toEqual([{ name: 'héllo 👍中', note: 'ok' }])
  })

  it('unicode strings survive a lazy pipeline', () => {
    expect(
      lazy(['👍a', '👍b'])
        .map((s) => s.toUpperCase())
        .all()
    ).toEqual(['👍A', '👍B'])
  })
})

describe('sparse arrays (audit: holes flow differently through map vs filter)', () => {
  // eslint-disable-next-line no-sparse-arrays
  const sparse = [1, , 3] as (number | undefined)[]

  it('count sees the full length including holes', () => {
    expect(collect(sparse).count()).toBe(3)
  })

  it('map visits holes as undefined (dense output)', () => {
    expect(
      collect(sparse)
        .map((v) => (v ?? 0) * 2)
        .all()
    ).toEqual([2, 0, 6])
  })

  it('filter skips holes entirely (Array.prototype.filter semantics)', () => {
    expect(
      collect(sparse)
        .filter(() => true)
        .all()
    ).toEqual([1, 3])
  })

  it('sum skips holes', () => {
    expect(collect(sparse).sumBy()).toBe(4)
  })

  it('compact drops holes and nullish values', () => {
    expect(collect(sparse).compact().all()).toEqual([1, 3])
  })
})

describe('CSV edge cases (audit: duplicate headers, ragged rows, quote handling)', () => {
  it('duplicate header columns: the last column wins (documented)', () => {
    expect(parseCsv('a,a\n1,2', { header: true })).toEqual([{ a: 2 }])
  })

  it('rows shorter than the header pad missing fields with empty strings', () => {
    expect(parseCsv('a,b,c\n1,2', { header: true })).toEqual([{ a: 1, b: 2, c: '' }])
  })

  it('rows longer than the header drop the extra fields', () => {
    expect(parseCsv('a\n1,2', { header: true })).toEqual([{ a: 1 }])
  })

  it('an unquoted empty field stays an empty string after coercion', () => {
    expect(parseCsv('a,b\n1,', { header: true })).toEqual([{ a: 1, b: '' }])
  })

  it('raw:true pads ragged rows with empty strings without coercion', () => {
    expect(parseCsv('a,b\n1', { header: true, raw: true })).toEqual([{ a: '1', b: '' }])
  })

  it("quote:'' disables quote handling — quotes parse literally", () => {
    expect(parseCsv('a,"b"\n"1",2', { header: true, quote: '' })).toEqual([{ a: '"1"', '"b"': 2 }])
  })

  it('an unterminated quote at EOF flushes the field as-is (documented)', () => {
    expect(parseCsv('"abc')).toEqual([['abc']])
  })

  it('handles classic-Mac lone \\r line endings', () => {
    expect(parseCsv('a\rb')).toEqual([['a'], ['b']])
  })

  it('keeps numeric-looking values that overflow to Infinity as strings', () => {
    const huge = '9'.repeat(400)
    expect(parseCsv(`a\n${huge}`, { header: true })).toEqual([{ a: huge }])
  })

  it('toCsv serialises array rows with an explicit columns header', () => {
    expect(
      toCsv(
        [
          [1, 2],
          [3, 4]
        ],
        { columns: ['x', 'y'] }
      )
    ).toBe('x,y\n1,2\n3,4')
  })

  it('toCsv turns null/undefined into empty fields and JSON-stringifies objects', () => {
    expect(toCsv([{ a: null, b: undefined, c: { deep: 1 } }])).toBe('a,b,c\n,,"{""deep"":1}"')
  })
})

describe('lines() decodes byte chunks mixed with string chunks', () => {
  it('splits across both chunk kinds on newlines', async () => {
    const out = await lines(mockBytes('a\nb', new TextEncoder().encode('c\nd'))).toArray()
    expect(out).toEqual(['a', 'bc', 'd'])
  })
})

describe('stream decoding options (audit: decodeAs:false and non-utf8 encodings untested)', () => {
  it('decodeAs:false stringifies byte chunks without decoding', async () => {
    const out = await fromReadable(mockBytes(new Uint8Array([104, 105])), {
      decodeAs: false
    }).toArray()
    expect(out).toEqual(['104,105'])
  })

  it('decodeAs latin1 decodes high bytes as ISO-8859-1', async () => {
    const out = await fromReadable(mockBytes(new Uint8Array([0xe9])), {
      decodeAs: 'latin1'
    }).toArray()
    expect(out.join('')).toBe('é')
  })

  it('flushes an incomplete multibyte tail as the replacement character', async () => {
    const euro = new TextEncoder().encode('€') // 3 bytes
    const out = await fromReadable(mockBytes(euro.slice(0, 2))).toArray()
    expect(out.join('')).toBe('�')
  })
})
