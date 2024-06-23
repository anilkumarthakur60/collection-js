import { collect } from "../collect"

describe('before', () => {
    it('The before method returns the item before the given item. null is returned if the given item is not found or is the first item:', () => {
        const collection = collect([1, 2, 3, 4, 5])
        expect(collection.before(3)).toBe(2)
        expect(collection.before(1)).toBe(null)
    })

    it('The before method supports loose comparison:', () => {
        const collection = collect([2, 4, 6, 8])
        expect(collection.before('4')).toBe(2)
    })

    it('The before method supports strict comparison:', () => {
        const collection = collect([2, 4, 6, 8])
        expect(collection.before('4', true)).toBe(null)
    })

    it('The before method supports custom closure:', () => {
        const collection = collect([2, 4, 6, 8])
        expect(collection.before((item: number) => item > 5)).toBe(4)
    })
})
