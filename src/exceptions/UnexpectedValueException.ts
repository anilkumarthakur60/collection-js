import { CollectionException } from './CollectionException'

export class UnexpectedValueException extends CollectionException {
  constructor(message: string) {
    super(message, 'UnexpectedValueException')
  }
}
