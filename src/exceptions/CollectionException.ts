export abstract class CollectionException extends Error {
  protected constructor(message: string, name: string) {
    super(message)
    this.name = name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
