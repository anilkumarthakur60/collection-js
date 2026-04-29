import { CollectionException } from './CollectionException'

export class MultipleItemsFoundException extends CollectionException {
  public readonly count: number

  constructor(count: number = 0, message?: string) {
    super(message ?? `${count} items were found.`)
    this.name = 'MultipleItemsFoundException'
    this.count = count
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
