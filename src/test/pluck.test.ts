import { collect } from '../collect'

describe('Collection.pluck', () => {
  it('should retrieve all values for the given key', () => {
    const collection = collect([
      { product_id: 'prod-100', name: 'Desk' },
      { product_id: 'prod-200', name: 'Chair' }
    ])

    const plucked = collection.pluck('name')
    expect(plucked.all()).toEqual(['Desk', 'Chair'])

    const plucked2 = collection.pluck('product_id')
    expect(plucked2.all()).toEqual(['prod-100', 'prod-200'])
  })

  it('should handle empty collections gracefully', () => {
    const collection = collect<{ name: string }>([])
    const plucked = collection.pluck('name')
    expect(plucked.all()).toEqual([])
  })

  it('should return undefined for non-existing keys', () => {
    const collection = collect([{ product_id: 'prod-100' }, { product_id: 'prod-200' }])

    const plucked = collection.pluck('name')
    expect(plucked.all()).toEqual([null, null])
  })

  it('should handle missing keys with specific key mapping', () => {
    const collection = collect([
      { product_id: 'prod-100', name: 'Desk' },
      { product_id: 'prod-200' },
      { product_id: 'prod-300', name: 'Chair' }
    ])
    const plucked = collection.pluck('name', 'product_id')
    expect(plucked.all()).toEqual([{ 'prod-100': 'Desk', 'prod-200': null, 'prod-300': 'Chair' }])
  })

  it('should use a specified key for the resulting collection', () => {
    const collection = collect([
      { product_id: 'prod-100', name: 'Desk' },
      { product_id: 'prod-200', name: 'Chair' }
    ])

    const plucked = collection.pluck('name', 'product_id')
    expect(plucked.all()).toEqual([
      {
        'prod-100': 'Desk',
        'prod-200': 'Chair'
      }
    ])
  })

  it('should retrieve nested values using dot notation', () => {
    const collection = collect([
      {
        name: 'Laracon',
        speakers: { first_day: ['Rosa', 'Judith'] }
      },
      {
        name: 'VueConf',
        speakers: { first_day: ['Abigail', 'Joey'] }
      }
    ])

    const plucked = collection.pluck('speakers.first_day')
    expect(plucked.all()).toEqual([
      ['Rosa', 'Judith'],
      ['Abigail', 'Joey']
    ])
  })

  it('should overwrite duplicate keys with the last matching element', () => {
    const collection = collect([
      { brand: 'Tesla', color: 'red' },
      { brand: 'Pagani', color: 'white' },
      { brand: 'Tesla', color: 'black' },
      { brand: 'Pagani', color: 'orange' }
    ])

    const plucked = collection.pluck('color', 'brand')
    expect(plucked.all()).toEqual([
      {
        Tesla: 'black',
        Pagani: 'orange'
      }
    ])
  })
  it('should handle collections with mixed types gracefully', () => {
    const collection = collect([
      { product_id: 'prod-100', name: 'Desk' },
      42,
      { product_id: 'prod-200', name: 'Chair' }
    ])

    const plucked = collection.pluck('name')
    expect(plucked.all()).toEqual(['Desk', null, 'Chair'])
  })

  it('should not mutate the original collection', () => {
    const data = [
      { product_id: 'prod-100', name: 'Desk' },
      { product_id: 'prod-200', name: 'Chair' }
    ]
    const collection = collect(data)

    collection.pluck('name')
    expect(collection.all()).toEqual(data) // Verify immutability
  })

  it('should retrieve numeric values as keys', () => {
    const collection = collect([
      { id: 1, value: 'One' },
      { id: 2, value: 'Two' }
    ])

    const plucked = collection.pluck('value', 'id')
    expect(plucked.all()).toEqual([
      {
        1: 'One',
        2: 'Two'
      }
    ])
  })

  it('should handle collections of primitive values without errors', () => {
    const collection = collect([1, 2, 3])
    const plucked = collection.pluck('key')
    expect(plucked.all()).toEqual([null, null, null])
  })
})
