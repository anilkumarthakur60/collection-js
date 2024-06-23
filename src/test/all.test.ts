import { collect } from "../collect"

describe('all', () => {
    it('The all method returns all items in the collection:', () => {
        const collection = collect([1, 2, 3, 4])
        expect(collection.all()).toEqual([1, 2, 3, 4])
    })

    it('The all method returns all items in the collection that pass the truth test provided as the first argument to the method:', () => {
        const collection = collect([1, 2, 3, 4])
        expect(collection.all((value) => value > 2)).toEqual([3, 4])
    })
})
