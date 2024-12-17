import { collect } from '../collect'

describe('Collection.intersectByKeys', () => {
  it('should retain keys that exist in both the collection and the given object', () => {
    const data = [
      { serial: 'UX301', type: 'screen', year: 2009 },
      { serial: 'UX404', type: 'tab', year: 2011 }
  ];
  const other = [
    { serial: 'UX301', type: 'screen', year: 2009 },
    { serial: 'UX404', type: 'tab', year: 2011 }
  ]

    const collection = collect(data)
    const result = collection.intersectByKeys(other)

    expect(result.toArray()).toEqual([{ type: 'screen', year: 2009 }])
  })

  it('should return an empty collection if no keys match', () => {
    const data = [
      { serial: 'UX301', type: 'screen' },
      { serial: 'UX404', type: 'tab' }
    ]
    const other = [
      { reference: 'UX404', name: 'tab' }
    ]

    const collection = collect(data)
    const result = collection.intersectByKeys(other)

    expect(result.toArray()).toEqual([{}])
  })

  it('should return the same collection if all keys match', () => {
    const data = [
      { serial: 'UX301', type: 'screen', year: 2009 },
      { serial: 'UX404', type: 'tab', year: 2011 }
    ]
    const other = [
      { serial: 'UX301', type: 'screen', year: 2009 },
      { serial: 'UX404', type: 'tab', year: 2011 }
    ]

    const collection = collect(data)
    const result = collection.intersectByKeys(other)

    expect(result.toArray()).toEqual([{ serial: 'UX301', type: 'screen', year: 2009 }])
  })

  it('should handle an empty given object and return an empty collection', () => {
    const data = [
      { serial: 'UX301', type: 'screen' },
      { serial: 'UX404', type: 'tab' }
    ]
    const other = []

    const collection = collect(data)
    const result = collection.intersectByKeys(other)

    expect(result.toArray()).toEqual([{}])
  })

  it('should handle an empty collection and return an empty collection', () => {
    const data = [
      { serial: 'UX301', type: 'screen' },
      { serial: 'UX404', type: 'tab' }
    ]
    const other = []

    const collection = collect(data)
    const result = collection.intersectByKeys(other)

    expect(result.toArray()).toEqual([{}])
  })
})
