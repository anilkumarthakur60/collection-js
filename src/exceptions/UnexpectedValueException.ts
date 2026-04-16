import { CollectionException } from '@/exceptions/CollectionException'

export class UnexpectedValueException extends CollectionException {
  constructor(message: string = 'Unexpected value encountered.') {
    super(message)
    this.name = 'UnexpectedValueException'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
