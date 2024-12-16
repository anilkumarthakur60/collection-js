import { collect } from '../collect'

describe('max', () => {
  it('should return the maximum value in the collection', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.max()).toEqual(5)
  })

  it('should return the maximum value in the collection using a callback', () => {
    const collection = collect([
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5 }
    ])
    expect(collection.max((item) => item.value)).toEqual(5)
  })

  it('should return the maximum value in the collection using a callback', () => {
    const collection = collect([
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5 }
    ])
    expect(collection.max((item) => item.value)).toEqual(5)
  })

  it('should return the maximum value in the collection using a callback', () => {
    const collection = collect([
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5 }
    ])
    expect(collection.max((item) => item.value)).toEqual(5)
  })

  it('should return the maximum value in the collection using a callback', () => {
    const collection = collect([
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5 }
    ])
    expect(collection.max((item) => item.value)).toEqual(5)
  })

  it('should return the maximum value in the collection using a callback', () => {
    const collection = collect([
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5 }
    ])
    expect(collection.max((item) => item.value)).toEqual(5)
  })

  it('should return the maximum value in the collection using a callback', () => {
    const collection = collect([
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5 }
    ])
    expect(collection.max((item) => item.value)).toEqual(5)
  })

  it('should return the maximum value in the collection using a callback', () => {
    const collection = collect([
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5 }
    ])
    expect(collection.max((item) => item.value)).toEqual(5)
  })
})
