export interface IReadonlyCollection<T> extends Iterable<T> {
  all(): T[]
  count(): number
  first(predicate?: (item: T, index: number) => boolean): T | null
  isEmpty(): boolean
  isNotEmpty(): boolean
  last(predicate?: (item: T, index: number) => boolean): T | undefined
  toArray(): T[]
  toJson(): string
}

export interface ILazyCollection<T> extends Iterable<T> {
  all(): T[]
  count(): number
  each(callback: (item: T, index: number) => void | false): this
  filter(callback: (item: T, index: number) => boolean): ILazyCollection<T>
  first(): T | null
  map<U>(callback: (item: T, index: number) => U): ILazyCollection<U>
  remember(): ILazyCollection<T>
  skip(count: number): ILazyCollection<T>
  take(count: number): ILazyCollection<T>
  takeUntilTimeout(timeout: Date): ILazyCollection<T>
  tapEach(callback: (item: T, index: number) => void): ILazyCollection<T>
  throttle(seconds: number): ILazyCollection<T>
  toArray(): T[]
  withHeartbeat(intervalMs: number, callback: () => void): ILazyCollection<T>
}
