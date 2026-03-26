import { collect } from '../src'

describe('when', () => {
  it('calls callback when condition is true', () => {
    let called = false
    collect([1, 2, 3]).when(true, () => {
      called = true
    })
    expect(called).toBe(true)
  })

  it('does not call callback when condition is false', () => {
    let called = false
    collect([1, 2, 3]).when(false, () => {
      called = true
    })
    expect(called).toBe(false)
  })

  it('calls fallback when condition is false', () => {
    let fallbackCalled = false
    collect([1, 2, 3]).when(
      false,
      () => {},
      () => {
        fallbackCalled = true
      }
    )
    expect(fallbackCalled).toBe(true)
  })

  it('returns the collection', () => {
    const c = collect([1, 2, 3])
    expect(c.when(true, () => {})).toBe(c)
  })

  it('passes collection to callback', () => {
    let items: number[] = []
    collect([1, 2, 3]).when(true, (c) => {
      items = c.all()
    })
    expect(items).toEqual([1, 2, 3])
  })
})

describe('whenEmpty', () => {
  it('calls callback when collection is empty', () => {
    let called = false
    collect([]).whenEmpty(() => {
      called = true
    })
    expect(called).toBe(true)
  })

  it('does not call callback when collection is not empty', () => {
    let called = false
    collect([1]).whenEmpty(() => {
      called = true
    })
    expect(called).toBe(false)
  })

  it('calls fallback when not empty', () => {
    let fallbackCalled = false
    collect([1, 2]).whenEmpty(
      () => {},
      () => {
        fallbackCalled = true
      }
    )
    expect(fallbackCalled).toBe(true)
  })

  it('returns the collection', () => {
    const c = collect([])
    expect(c.whenEmpty(() => {})).toBe(c)
  })
})

describe('whenNotEmpty', () => {
  it('calls callback when collection is not empty', () => {
    let called = false
    collect([1, 2]).whenNotEmpty(() => {
      called = true
    })
    expect(called).toBe(true)
  })

  it('does not call callback when empty', () => {
    let called = false
    collect([]).whenNotEmpty(() => {
      called = true
    })
    expect(called).toBe(false)
  })

  it('calls fallback when empty', () => {
    let fallbackCalled = false
    collect([]).whenNotEmpty(
      () => {},
      () => {
        fallbackCalled = true
      }
    )
    expect(fallbackCalled).toBe(true)
  })

  it('returns the collection', () => {
    const c = collect([1])
    expect(c.whenNotEmpty(() => {})).toBe(c)
  })
})
