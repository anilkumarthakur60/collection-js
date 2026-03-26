import { parseCsv, toCsv } from '../src'

describe('parseCsv', () => {
  it('parses rows without header', () => {
    expect(parseCsv('a,b,c\n1,2,3')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ])
  })

  it('parses with header into objects with coerced types', () => {
    const result = parseCsv('name,age,active\nAlice,30,true\nBob,25,false', { header: true })
    expect(result).toEqual([
      { name: 'Alice', age: 30, active: true },
      { name: 'Bob', age: 25, active: false },
    ])
  })

  it('keeps values as strings when raw is true', () => {
    const result = parseCsv('a,b\n1,2', { header: true, raw: true })
    expect(result).toEqual([{ a: '1', b: '2' }])
  })

  it('handles quoted fields with embedded commas', () => {
    const result = parseCsv('name\n"Bob, Jr"', { header: true, raw: true })
    expect(result).toEqual([{ name: 'Bob, Jr' }])
  })

  it('handles escaped quotes within quoted fields', () => {
    const result = parseCsv('q\n"He said ""hi"""', { header: true, raw: true })
    expect(result).toEqual([{ q: 'He said "hi"' }])
  })

  it('handles \\r\\n and \\n line endings', () => {
    const a = parseCsv('a,b\r\n1,2', { header: true, raw: true })
    const b = parseCsv('a,b\n1,2', { header: true, raw: true })
    expect(a).toEqual(b)
  })

  it('respects custom delimiter', () => {
    const result = parseCsv('a;b\n1;2', { header: true, raw: true, delimiter: ';' })
    expect(result).toEqual([{ a: '1', b: '2' }])
  })

  it('returns empty for empty input', () => {
    expect(parseCsv('', { header: true })).toEqual([])
  })

  it('coerces null/true/false/numbers', () => {
    const result = parseCsv('a,b,c,d\nnull,true,42,1.5', { header: true })
    expect(result).toEqual([{ a: null, b: true, c: 42, d: 1.5 }])
  })
})

describe('toCsv', () => {
  it('serializes object rows with auto-detected columns', () => {
    expect(toCsv([{ a: 1, b: 'x' }, { a: 2, b: 'y' }])).toBe('a,b\n1,x\n2,y')
  })

  it('serializes array rows', () => {
    expect(toCsv([['1', 'a'], ['2', 'b']])).toBe('1,a\n2,b')
  })

  it('quotes values containing the delimiter', () => {
    expect(toCsv([{ x: 'a,b' }])).toBe('x\n"a,b"')
  })

  it('escapes embedded quotes by doubling them', () => {
    expect(toCsv([{ x: 'he said "hi"' }])).toBe('x\n"he said ""hi"""')
  })

  it('skips header when header: false', () => {
    expect(toCsv([{ a: 1, b: 2 }], { header: false })).toBe('1,2')
  })

  it('uses explicit columns and order when supplied', () => {
    expect(toCsv([{ a: 1, b: 2, c: 3 }], { columns: ['c', 'a'] })).toBe('c,a\n3,1')
  })

  it('uses custom delimiter and EOL', () => {
    expect(toCsv([{ a: 1, b: 2 }], { delimiter: ';', eol: '\r\n' })).toBe('a;b\r\n1;2')
  })

  it('returns empty string for empty input', () => {
    expect(toCsv([])).toBe('')
  })
})
