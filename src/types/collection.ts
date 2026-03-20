export interface IReadonlyCollection<T> extends Iterable<T> {
  all(): T[]
  count(): number
  isEmpty(): boolean
  isNotEmpty(): boolean
  toArray(): T[]
  toJson(): string
  first(predicate?: (item: T, index: number) => boolean): T | null
  last(predicate?: (item: T, index: number) => boolean): T | undefined
}

export interface ILazyCollection<T> extends Iterable<T> {
  all(): T[]
  count(): number
  first(): T | null
  toArray(): T[]
  each(callback: (item: T, index: number) => void | false): this
  map<U>(callback: (item: T, index: number) => U): ILazyCollection<U>
  filter(callback: (item: T, index: number) => boolean): ILazyCollection<T>
  take(count: number): ILazyCollection<T>
  skip(count: number): ILazyCollection<T>
}
