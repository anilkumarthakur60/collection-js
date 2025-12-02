import { CollectionException } from './CollectionException'

export class MultipleItemsFoundException extends CollectionException {
  constructor(count: number) {
    super(`${count} items were found.`, 'MultipleItemsFoundException')
  }
}
