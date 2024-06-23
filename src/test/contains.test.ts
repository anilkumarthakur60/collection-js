import { collect } from "../collect"

describe('contains', () => {
    it('The contains method determines if the collection contains a given item:', () => {
        const collection = collect([1, 2, 3, 4, 5])
        expect(collection.contains(3)).toBe(true)
        expect(collection.contains(6)).toBe(false)
    })

    it('The contains method works with strings:', () => {
        const collection = collect(['apple', 'banana', 'cherry'])
        expect(collection.contains('banana')).toBe(true)
        expect(collection.contains('grape')).toBe(false)
    })

    it('The contains method works with a predicate function:', () => {
        const collection = collect([1, 2, 3, 4, 5])
        expect(collection.contains((item) => item > 4)).toBe(true)
        expect(collection.contains((item) => item > 5)).toBe(false)
    })

    it('The contains method works with complex objects:', () => {
        const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
        expect(collection.contains((item) => item.id === 2)).toBe(true)
        expect(collection.contains((item) => item.id === 4)).toBe(false)
    })

    it('The contains method works with mixed data types:', () => {
        const collection = collect([1, 'apple', true])
        expect(collection.contains('apple')).toBe(true)
        expect(collection.contains(false)).toBe(false)
        expect(collection.contains(1)).toBe(true)
        expect(collection.contains(true)).toBe(true)
    })

    it('The contains method works with key-value pairs:', () => {
        const collection = collect([
            { name: 'John Doe', age: 25 },
            { name: 'Jane Doe', age: 24 },
            { name: 'Johnny Doe', age: 30 },
            { name: 'Janie Doe', age: 29 },
            { name: 'John Doe', age: 27 },
        ])

        expect(collection.contains({ name: 'Jane Doe', age: 24 })).toBe(true)
        expect(collection.contains({ name: 'Jane Doe', age: 25 })).toBe(false)
        expect(collection.contains({ name: 'John Doe', age: 27 })).toBe(true)
    })
})
