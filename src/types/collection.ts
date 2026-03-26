export interface IReadonlyCollection<T> extends Iterable<T> {
  all(): T[]
  contains(value: T | ((item: T) => boolean) | Partial<T>): boolean
  count(): number
  every(callback: (item: T, index: number) => boolean): boolean
  first(predicate?: (item: T, index: number) => boolean): T | null
  isEmpty(): boolean
  isNotEmpty(): boolean
  last(predicate?: (item: T, index: number) => boolean): T | undefined
  some(callback: (item: T) => boolean): boolean
  toArray(): T[]
  toJson(): string
  toMap<K, V>(keyFn: (item: T) => K, valueFn: (item: T) => V): Map<K, V>
  toSet(): Set<T>
}

export interface ILazyCollection<T> extends Iterable<T> {
  all(): T[]
  chunk(size: number): ILazyCollection<T[]>
  concat<U>(items: Iterable<U>): ILazyCollection<T | U>
  contains(value: T | ((item: T) => boolean)): boolean
  count(): number
  each(callback: (item: T, index: number) => void | false): this
  every(callback: (item: T) => boolean): boolean
  filter(callback: (item: T, index: number) => boolean): ILazyCollection<T>
  first(): T | null
  flatMap<U>(callback: (item: T) => Iterable<U>): ILazyCollection<U>
  map<U>(callback: (item: T, index: number) => U): ILazyCollection<U>
  reduce<U>(callback: (acc: U, item: T, index: number) => U, initial: U): U
  reject(callback: (item: T, index: number) => boolean): ILazyCollection<T>
  remember(): ILazyCollection<T>
  skip(count: number): ILazyCollection<T>
  skipUntil(callback: T | ((item: T) => boolean)): ILazyCollection<T>
  skipWhile(callback: (item: T) => boolean): ILazyCollection<T>
  some(callback: (item: T) => boolean): boolean
  take(count: number): ILazyCollection<T>
  takeUntil(callback: T | ((item: T) => boolean)): ILazyCollection<T>
  takeUntilTimeout(timeout: Date): ILazyCollection<T>
  takeWhile(callback: (item: T) => boolean): ILazyCollection<T>
  tap(callback: (collection: ILazyCollection<T>) => void): ILazyCollection<T>
  tapEach(callback: (item: T, index: number) => void): ILazyCollection<T>
  throttle(seconds: number): ILazyCollection<T>
  toArray(): T[]
  unique(callback?: (item: T) => unknown): ILazyCollection<T>
  values(): ILazyCollection<T>
  withHeartbeat(intervalMs: number, callback: () => void): ILazyCollection<T>
  zip<U>(values: Iterable<U>): ILazyCollection<[T, U]>
}
