import { CollectionException } from './CollectionException'

export class ItemNotFoundException extends CollectionException {
  constructor(message: string = 'Item not found.') {
    super(message)
    this.name = 'ItemNotFoundException'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
