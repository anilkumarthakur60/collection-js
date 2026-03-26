export class CollectionException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CollectionException'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
