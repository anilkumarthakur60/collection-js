import { collect } from '../collect'

describe('concat', () => {
  it('The concat method appends the given array values onto the end of the collection:', () => {
    const collection = collect(['John Doe'])
    const concatenated = collection.concat(['Jane Doe']).concat(['Johnny Doe'])
    expect(concatenated.all()).toEqual(['John Doe', 'Jane Doe', 'Johnny Doe'])
  })

  it('The concat method appends the given collection values onto the end of the collection:', () => {
    const collection = collect(['John Doe'])
    const otherCollection = collect(['Jane Doe'])
    const concatenated = collection.concat(otherCollection).concat(['Johnny Doe'])
    expect(concatenated.all()).toEqual(['John Doe', 'Jane Doe', 'Johnny Doe'])
  })

  it('The concat method works correctly with an empty array:', () => {
    const collection = collect(['John Doe'])
    const concatenated = collection.concat([])
    expect(concatenated.all()).toEqual(['John Doe'])
  })

  it('The concat method works correctly with an empty collection:', () => {
    const collection = collect(['John Doe'])
    const otherCollection = collect<string>([])
    const concatenated = collection.concat(otherCollection)
    expect(concatenated.all()).toEqual(['John Doe'])
  })

  it('The concat method works correctly with different data types:', () => {
    const collection = collect(['John Doe'])
    const concatenated = collection.concat([123, true, 'Jane Doe'])
    expect(concatenated.all()).toEqual(['John Doe', 123, true, 'Jane Doe'])
  })
})
