import { collect } from '../src'

describe('duplicates', () => {
  it('returns a Record keyed by index of duplicate items', () => {
    // Laravel: duplicates returns the items that are duplicates, keyed by
    // their original index in the source.
    expect(collect(['a', 'b', 'a', 'c', 'b']).duplicates()).toEqual({ 2: 'a', 4: 'b' })
  })

  it('returns empty record when no duplicates', () => {
    expect(collect([1, 2, 3]).duplicates()).toEqual({})
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).duplicates()).toEqual({})
  })

  it('works with a key on objects', () => {
    const items = [
      { email: 'abigail@example.com', position: 'Developer' },
      { email: 'james@example.com', position: 'Designer' },
      { email: 'victoria@example.com', position: 'Developer' }
    ]
    expect(collect(items).duplicates('position')).toEqual({ 2: items[2] })
  })

  it('keeps later occurrences', () => {
    expect(collect([1, 2, 2]).duplicates()).toEqual({ 2: 2 })
  })
})

describe('duplicatesStrict', () => {
  it('returns duplicates by strict comparison', () => {
    expect(collect([1, '1', 2, 2]).duplicatesStrict()).toEqual({ 3: 2 })
  })

  it('returns empty for no duplicates', () => {
    expect(collect([1, 2, 3]).duplicatesStrict()).toEqual({})
  })

  it('works with a key on objects', () => {
    const items = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Alice' }]
    expect(collect(items).duplicatesStrict('name')).toEqual({ 2: items[2] })
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).duplicatesStrict()).toEqual({})
  })
})

describe('duplicates with index-aware retriever (regression: index was hardcoded to 0)', () => {
  it('duplicates passes the real index to the retriever', () => {
    // Each element maps to its own index, so nothing is a duplicate.
    expect(collect([10, 20, 30]).duplicates((_item, index) => index)).toEqual({})
  })

  it('duplicatesStrict passes the real index to the retriever', () => {
    expect(collect([10, 20, 30]).duplicatesStrict((_item, index) => index)).toEqual({})
  })

  it('flags duplicates when the retriever collapses distinct indices', () => {
    // Keys become [0, 1, 0]  index 2 duplicates index 0.
    expect(collect([10, 20, 30]).duplicates((_item, index) => index % 2)).toEqual({ 2: 30 })
  })
})
