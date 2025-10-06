import { CollectionException } from './CollectionException'

export class ItemNotFoundException extends CollectionException {
  constructor(message: string) {
    super(message, 'ItemNotFoundException')
  }
}
