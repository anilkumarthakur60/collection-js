class ItemNotFoundException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ItemNotFoundException'
    Object.setPrototypeOf(this, ItemNotFoundException.prototype)
  }
}

export { ItemNotFoundException }
