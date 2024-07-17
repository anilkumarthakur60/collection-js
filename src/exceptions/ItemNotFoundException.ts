export class ItemNotFoundException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ItemNotFoundException'
  }
}
