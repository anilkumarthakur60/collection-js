import { collect } from '../collect'

describe('unless', () => {
  it('calls callback when condition is false', () => {
    let called = false
    collect([1, 2, 3]).unless(false, () => {
      called = true
    })
    expect(called).toBe(true)
  })

  it('does not call callback when condition is true', () => {
    let called = false
    collect([1, 2, 3]).unless(true, () => {
      called = true
    })
    expect(called).toBe(false)
  })

  it('calls fallback when condition is true', () => {
    let fallbackCalled = false
    collect([1, 2, 3]).unless(
      true,
      () => {},
      () => {
        fallbackCalled = true
      }
    )
    expect(fallbackCalled).toBe(true)
  })

  it('returns the collection', () => {
    const c = collect([1, 2, 3])
    expect(c.unless(false, () => {})).toBe(c)
  })

  it('passes collection to callback', () => {
    let items: number[] = []
    collect([1, 2, 3]).unless(false, (c) => {
      items = c.all()
    })
    expect(items).toEqual([1, 2, 3])
  })
})

describe('unlessEmpty', () => {
  it('calls callback when collection is not empty', () => {
    let called = false
    collect([1, 2]).unlessEmpty(() => {
      called = true
    })
    expect(called).toBe(true)
  })

  it('does not call callback when collection is empty', () => {
    let called = false
    collect([]).unlessEmpty(() => {
      called = true
    })
    expect(called).toBe(false)
  })

  it('returns the collection', () => {
    const c = collect([1])
    expect(c.unlessEmpty(() => {})).toBe(c)
  })
})

describe('unlessNotEmpty', () => {
  it('calls callback when collection is empty', () => {
    let called = false
    collect([]).unlessNotEmpty(() => {
      called = true
    })
    expect(called).toBe(true)
  })

  it('does not call callback when collection is not empty', () => {
    let called = false
    collect([1, 2]).unlessNotEmpty(() => {
      called = true
    })
    expect(called).toBe(false)
  })

  it('returns the collection', () => {
    const c = collect([])
    expect(c.unlessNotEmpty(() => {})).toBe(c)
  })
})
