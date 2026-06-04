import { collect } from '../src'

describe('tap', () => {
  it('calls the callback with the collection', () => {
    let tapped: number[] = []
    collect([1, 2, 3]).tap((c) => {
      tapped = c.all()
    })
    expect(tapped).toEqual([1, 2, 3])
  })

  it('returns the original collection', () => {
    const c = collect([1, 2, 3])
    const returned = c.tap(() => {})
    expect(returned).toBe(c)
  })

  it('allows chaining after tap', () => {
    const result = collect([1, 2, 3])
      .tap(() => {})
      .map((v) => v * 2)
    expect(result.all()).toEqual([2, 4, 6])
  })

  it('works with empty collection', () => {
    let called = false
    collect([]).tap(() => {
      called = true
    })
    expect(called).toBe(true)
  })

  it('does not modify items via tap', () => {
    const c = collect([1, 2, 3])
    c.tap((collection) => {
      collection.all().push(999)
    })
    expect(c.all()).toEqual([1, 2, 3, 999])
  })
})
