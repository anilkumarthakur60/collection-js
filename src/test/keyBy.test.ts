import { collect } from '../collect'

describe('keyBy', () => {
  it('should key the collection by the specified string property', () => {
    const data = [
      { product_id: 'prod-100', name: 'Desk' },
      { product_id: 'prod-200', name: 'Chair' }
    ]

    const collection = collect(data)
    const result = collection.keyBy((item) => item.product_id)

    expect(result).toEqual({
      'prod-100': { product_id: 'prod-100', name: 'Desk' },
      'prod-200': { product_id: 'prod-200', name: 'Chair' }
    })
  })

  it('should key the collection using a callback function', () => {
    const data = [
      { product_id: 'prod-100', name: 'Desk' },
      { product_id: 'prod-200', name: 'Chair' }
    ]

    const collection = collect(data)
    const result = collection.keyBy((item) => item.product_id.toUpperCase())

    expect(result).toEqual({
      'PROD-100': { product_id: 'prod-100', name: 'Desk' },
      'PROD-200': { product_id: 'prod-200', name: 'Chair' }
    })
  })

  it('should overwrite duplicate keys with the last occurrence', () => {
    const data = [
      { product_id: 'prod-100', name: 'Desk' },
      { product_id: 'prod-100', name: 'Updated Desk' },
      { product_id: 'prod-200', name: 'Chair' }
    ]

    const collection = collect(data)
    const result = collection.keyBy((item) => item.product_id)

    expect(result).toEqual({
      'prod-100': { product_id: 'prod-100', name: 'Updated Desk' },
      'prod-200': { product_id: 'prod-200', name: 'Chair' }
    })
  })

  it('should key the collection using nested object properties', () => {
    const data = [
      { product: { id: 'prod-100', name: 'Desk' } },
      { product: { id: 'prod-200', name: 'Chair' } }
    ]

    const collection = collect(data)
    const result = collection.keyBy((item) => item.product.id)

    expect(result).toEqual({
      'prod-100': { product: { id: 'prod-100', name: 'Desk' } },
      'prod-200': { product: { id: 'prod-200', name: 'Chair' } }
    })
  })

  it('should provide the correct parameters to the callback function', () => {
    const data = [
      { product_id: 'prod-100', name: 'Desk' },
      { product_id: 'prod-200', name: 'Chair' }
    ]

    const collection = collect(data)
    const mockCallback = jest.fn(
      (item: { product_id: string; name: string }, index: number) => item.product_id + '-' + index
    )
    const result = collection.keyBy(mockCallback)

    // Assert the callback was called the correct number of times
    expect(mockCallback).toHaveBeenCalledTimes(2)

    // Assert the arguments passed to the callback for each call
    expect(mockCallback).toHaveBeenNthCalledWith(1, data[0], 0)
    expect(mockCallback).toHaveBeenNthCalledWith(2, data[1], 1)

    // Assert the resulting keyed collection
    expect(result).toEqual({
      'prod-100-0': { product_id: 'prod-100', name: 'Desk' },
      'prod-200-1': { product_id: 'prod-200', name: 'Chair' }
    })
  })
})
