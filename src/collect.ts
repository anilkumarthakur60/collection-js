import { Iteratee, Predicate, PredicateChulkWhile, PredicateContains } from './types/main'

export class Collection<T> {
  private items: T[]

  constructor(items: T[] = []) {
    this.items = items
  }

  all(predicate?: Predicate<T>): T[] {
    if (predicate) {
      return this.items.filter((item, index) => predicate(item, index))
    }
    return this.items
  }

  after(item: T | string | Predicate<T>, strict: boolean = false): T | null {
    if (typeof item === 'function') {
      const predicate = item as Predicate<T>
      for (let i = 0; i < this.items.length; i++) {
        if (predicate(this.items[i], i)) {
          return this.items[i + 1] || null
        }
      }
      return null
    } else {
      const index = this.items.findIndex((i) => (strict ? i === item : i == item))
      if (index === -1 || index === this.items.length - 1) {
        return null
      }
      return this.items[index + 1]
    }
  }

  average(callback?: (item: T) => number): number {
    if (this.items.length === 0) {
      return 0
    }
    if (callback) {
      return this.sum(callback) / this.items.length
    }

    return this.sum((item) => Number(item)) / this.items.length
  }

  avg(callback?: (item: T) => number): number {
    return this.average(callback)
  }

  before(item: T | string | Predicate<T>, strict: boolean = false): T | null {
    if (typeof item === 'function') {
      const predicate = item as Predicate<T>
      for (let i = 1; i < this.items.length; i++) {
        if (predicate(this.items[i], i)) {
          return this.items[i - 1]
        }
      }
      return null
    } else {
      const index = this.items.findIndex((i) => (strict ? i === item : i == item))
      if (index === -1 || index === 0) {
        return null
      }
      return this.items[index - 1]
    }
  }

  chunk(size: number): Collection<Collection<T>> {
    if (size <= 0) return new Collection<Collection<T>>([])
    const chunks: Collection<T>[] = []
    for (let i = 0; i < this.items.length; i += size) {
      chunks.push(new Collection(this.items.slice(i, i + size)))
    }

    return new Collection(chunks)
  }

  chunkWhile(predicate: PredicateChulkWhile<T>): Collection<Collection<T>> {
    if (this.items.length === 0) return new Collection<Collection<T>>([])

    const chunks: Collection<T>[] = []
    let currentChunk: T[] = []

    for (let i = 0; i < this.items.length; i++) {
      if (i === 0 || predicate(this.items[i], i, this.items)) {
        currentChunk.push(this.items[i])
      } else {
        chunks.push(new Collection(currentChunk))
        currentChunk = [this.items[i]]
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(new Collection(currentChunk))
    }

    return new Collection(chunks)
  }

  collapse<U>(): Collection<U> {
    const flattened: U[] = []
    this.items.forEach((item) => {
      if (Array.isArray(item)) {
        flattened.push(...(item as unknown as U[]))
      } else {
        flattened.push(item as unknown as U)
      }
    })
    return new Collection(flattened)
  }

  // collect<U>(callback: (item: T, index: number) => U): Collection<U> {
  //   return new Collection(this.items.map(callback))
  // }
  collect(): Collection<T> {
    return new Collection(this.items)
  }

  combine<U>(values: U[]): Collection<[T, U]> {
    const combined: [T, U][] = []
    for (let i = 0; i < this.items.length; i++) {
      if (i < values.length) {
        combined.push([this.items[i], values[i]])
      } else {
        combined.push([this.items[i], undefined as unknown as U])
      }
    }
    return new Collection(combined)
  }

  concat<U>(items: U[] | Collection<U>): Collection<T | U> {
    const newItems = items instanceof Collection ? items.all() : items
    return new Collection((this.items as (T | U)[]).concat(newItems))
  }

  contains(value: T | PredicateContains<T> | Partial<T>): boolean {
    if (typeof value === 'function') {
      return this.items.some(value as Predicate<T>)
    }

    if (typeof value === 'object' && value !== null) {
      return this.items.some((item) =>
        Object.keys(value).every(
          (key) =>
            (item as Record<string, unknown>)[key] === (value as Record<string, unknown>)[key]
        )
      )
    }

    return this.items.includes(value as T)
  }

  containsOneItem(callback?: PredicateContains<T>): boolean {
    if (callback) {
      return this.items.filter(callback).length === 1
    }
    return this.items.length === 1
  }

  containsStrict(value: T): boolean {
    return this.items.includes(value)
  }

  count(): number {
    return this.items.length
  }

  countBy(iteratee: Iteratee<T>): Record<string, number> {
    return this.items.reduce((acc: Record<string, number>, item: T) => {
      const key = iteratee(item).toString()
      if (!acc[key]) {
        acc[key] = 0
      }
      acc[key]++
      return acc
    }, {})
  }

  crossJoin<U>(values: U[]): Collection<[T, U]> {
    const combined: [T, U][] = []
    this.items.forEach((item) => {
      values.forEach((value) => {
        combined.push([item, value])
      })
    })
    return new Collection(combined)
  }

  dd(): void {
    console.log(this.items)
  }

  diff(values: T[]): Collection<T> {
    const diffItems = this.items.filter((item) => !values.includes(item))
    return new Collection(diffItems)
  }

  diffAssoc(values: T[]): Collection<T> {
    const diffItems = this.items.filter((item) => !values.includes(item))
    return new Collection(diffItems)
  }

  diffAssocUsing(values: T[], callback: (item: T) => unknown): Collection<T> {
    const diffItems = this.items.filter(
      (item) => !values.some((value) => callback(value) === callback(item))
    )
    return new Collection(diffItems)
  }

  diffKeys<K extends keyof T>(values: K[]): Collection<T> {
    const diffItems = this.items.filter((item) => !values.includes(item as unknown as K))
    return new Collection(diffItems)
  }

  doesntContain(callback: (item: T) => boolean): boolean {
    return !this.contains(callback)
  }

  dot(): Record<string, T> {
    const result: Record<string, T> = {}
    this.items.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        Object.assign(result, item)
      }
    })
    return result
  }

  dump(): void {
    console.log(this.items)
  }

  duplicates(): Collection<T> {
    return this.filter((item, index, array) => array.indexOf(item) !== index)
  }

  duplicatesStrict(): Collection<T> {
    return this.filter((item, index, array) => array.indexOf(item) !== index)
  }

  each(callback: (item: T, index: number) => void): void {
    this.items.forEach(callback)
  }
  eachSpread(callback: (...args: T extends (infer I)[] ? I[] : never) => void): void {
    this.items.forEach((item) => callback(...(item as T extends (infer I)[] ? I[] : never)))
  }

  ensure(callback: (item: T) => boolean): Collection<T> {
    return new Collection(this.items.filter(callback))
  }

  every(callback: (item: T) => boolean): boolean {
    return this.items.every(callback)
  }

  except<K extends keyof T>(keys: K[]): Collection<Omit<T, K>> {
    return new Collection(
      this.items.map((item) => {
        const copy = { ...item }
        keys.forEach((key) => delete copy[key])
        return copy
      }) as Omit<T, K>[]
    )
  }

  filter(callback: (item: T, index: number, array: T[]) => boolean): Collection<T> {
    return new Collection(this.items.filter(callback))
  }

  first(): T | undefined {
    return this.items[0]
  }

  firstOrFail(): T {
    if (this.items.length === 0) {
      throw new Error('No items found')
    }
    return this.items[0]
  }

  firstWhere<K extends keyof T>(key: K, value: T[K]): T | undefined {
    return this.items.find((item) => item[key] === value)
  }

  flatMap<U>(callback: (item: T) => U[]): Collection<U> {
    return new Collection(this.items.flatMap(callback))
  }

  flatten<U>(): Collection<U> {
    const flattened: U[] = []
    this.items.forEach((item) => {
      if (Array.isArray(item)) {
        flattened.push(...(item as unknown as U[]))
      } else {
        flattened.push(item as unknown as U)
      }
    })
    return new Collection(flattened)
  }

  flip(): Collection<Record<string, number>> {
    const flippedItems: Record<string, number> = {}
    this.items.forEach((value, index) => {
      if (typeof value === 'string' || typeof value === 'number') {
        flippedItems[String(value)] = index
      } else {
        throw new Error('Collection items must be of type string or number to flip.')
      }
    })
    return new Collection([flippedItems])
  }

  forget<K extends keyof T>(key: K): Collection<Omit<T, K>> {
    return new Collection(
      this.items.map((item) => {
        const copy = { ...item }
        delete copy[key]
        return copy
      }) as Omit<T, K>[]
    )
  }

  forPage(page: number, perPage: number): Collection<T> {
    return new Collection(this.items.slice((page - 1) * perPage, page * perPage))
  }

  get(index: number): T | undefined {
    return this.items[index]
  }

  groupBy<K extends keyof T>(key: K): Record<string, T[]> {
    return this.items.reduce(
      (result, item) => {
        const groupKey = String(item[key])
        if (!result[groupKey]) {
          result[groupKey] = []
        }
        result[groupKey].push(item)
        return result
      },
      {} as Record<string, T[]>
    )
  }

  has<K extends keyof T>(key: K): boolean {
    return this.items.some((item) => typeof item === 'object' && item !== null && key in item)
  }

  hasAny<K extends keyof T>(keys: K[]): boolean {
    return keys.some((key) => this.has(key))
  }

  implode<K extends keyof T>(separator: string, key: K): string {
    return this.items.map((item) => String(item[key])).join(separator)
  }

  intersect(values: T[]): Collection<T> {
    const intersectItems = this.items.filter((item) => values.includes(item))
    return new Collection(intersectItems)
  }

  intersectAssoc(values: T[]): Collection<T> {
    const intersectItems = this.items.filter((item) => values.includes(item))
    return new Collection(intersectItems)
  }

  intersectByKeys<K extends keyof T>(keys: K[]): Collection<T> {
    const intersectItems = this.items.filter((item) => keys.includes(item as unknown as K))
    return new Collection(intersectItems)
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  isNotEmpty(): boolean {
    return this.items.length > 0
  }

  join<K extends keyof T>(separator: string, key: K): string {
    return this.items.map((item) => String(item[key])).join(separator)
  }

  keyBy<K extends keyof T>(key: K): Record<string, T> {
    return this.items.reduce(
      (result, item) => {
        result[String(item[key])] = item
        return result
      },
      {} as Record<string, T>
    )
  }

  keys(): (keyof T)[] {
    return Object.keys(this.items) as (keyof T)[]
  }

  last(): T | undefined {
    return this.items[this.items.length - 1]
  }

  make<U>(callback: (item: T) => U): Collection<U> {
    return new Collection(this.items.map(callback))
  }

  map<U>(callback: (item: T) => U): Collection<U> {
    return new Collection(this.items.map(callback))
  }

  mapInto<U>(classType: new () => U): Collection<U> {
    return new Collection(this.items.map(() => new classType()))
  }

  mapSpread<U>(callback: (...args: T extends (infer I)[] ? I[] : never) => U): Collection<U> {
    return new Collection(
      this.items.map((item) => callback(...(item as T extends (infer I)[] ? I[] : never)))
    )
  }

  mapToGroups<K extends keyof T>(key: K): Record<string, T[]> {
    return this.items.reduce(
      (result, item) => {
        const groupKey = String(item[key])
        if (!result[groupKey]) {
          result[groupKey] = []
        }
        result[groupKey].push(item)
        return result
      },
      {} as Record<string, T[]>
    )
  }

  mapWithKeys<K extends keyof T, U>(key: K, callback: (item: T) => U): Record<string, U> {
    return this.items.reduce(
      (result, item) => {
        result[String(item[key])] = callback(item)
        return result
      },
      {} as Record<string, U>
    )
  }

  max(callback: (item: T) => number): number {
    return Math.max(...this.items.map(callback))
  }

  median(callback: (item: T) => number): number {
    const sorted = this.items.map(callback).sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]
  }

  merge<U>(values: U[]): Collection<T | U> {
    return new Collection([...this.items, ...values])
  }

  mergeRecursive<U>(values: U[]): Collection<T | U> {
    return new Collection([...this.items, ...values])
  }

  min(callback: (item: T) => number): number {
    return Math.min(...this.items.map(callback))
  }

  mode(callback: (item: T) => number): number {
    const counts = this.items.reduce(
      (result, item) => {
        const key = callback(item)
        if (!result[key]) {
          result[key] = 0
        }
        result[key]++
        return result
      },
      {} as Record<string, number>
    )
    const max = Math.max(...Object.values(counts))
    return Number(Object.keys(counts).find((key) => counts[key] === max))
  }

  nth(n: number): T | undefined {
    return this.items[n]
  }

  only<K extends keyof T>(keys: K[]): Collection<Pick<T, K>> {
    return new Collection(
      this.items.map((item) => {
        const copy = {} as Pick<T, K>
        keys.forEach((key) => (copy[key] = item[key]))
        return copy
      })
    )
  }

  pad(size: number, value: T): Collection<T> {
    const newItems = [...this.items]
    while (newItems.length < size) {
      newItems.push(value)
    }
    return new Collection(newItems)
  }

  partition(callback: (item: T) => boolean): [Collection<T>, Collection<T>] {
    const [truthy, falsy] = this.items.reduce(
      ([truthy, falsy], item) => {
        if (callback(item)) {
          truthy.push(item)
        } else {
          falsy.push(item)
        }
        return [truthy, falsy]
      },
      [[], []] as [T[], T[]]
    )
    return [new Collection(truthy), new Collection(falsy)]
  }

  percentage(callback: (item: T) => number): number {
    return this.sum(callback) / this.items.length
  }

  pluck<K extends keyof T>(key: K): Collection<T[K]> {
    return new Collection(this.items.map((item) => item[key]))
  }

  pop(): T | undefined {
    return this.items.pop()
  }

  prepend(value: T): Collection<T> {
    return new Collection([value, ...this.items])
  }

  pull(value: T): Collection<T> {
    return new Collection(this.items.filter((item) => item !== value))
  }

  push(value: T): Collection<T> {
    this.items.push(value)
    return this
  }

  put<K extends keyof T, V extends T[K]>(key: K, value: V): Collection<T> {
    return new Collection(
      this.items.map((item) => {
        const copy = { ...item }
        copy[key] = value
        return copy
      })
    )
  }

  random(): T | undefined {
    return this.items[Math.floor(Math.random() * this.items.length)]
  }

  range(start: number, end: number): Collection<number> {
    return new Collection([...Array(end - start + 1).keys()].map((i) => i + start))
  }

  reduce<U>(callback: (accumulator: U, item: T) => U, initialValue: U): U {
    return this.items.reduce(callback, initialValue)
  }

  reject(callback: (item: T) => boolean): Collection<T> {
    return new Collection(this.items.filter((item) => !callback(item)))
  }

  replace(search: T, replace: T): Collection<T> {
    return new Collection(this.items.map((item) => (item === search ? replace : item)))
  }

  replaceRecursive(search: T, replace: T): Collection<T> {
    return new Collection(this.items.map((item) => (item === search ? replace : item)))
  }

  reverse(): Collection<T> {
    return new Collection([...this.items].reverse())
  }

  search(value: T): number {
    return this.items.indexOf(value)
  }

  select<K extends keyof T>(key: K): Collection<T[K]> {
    return new Collection(this.items.map((item) => item[key]))
  }

  shift(): T | undefined {
    return this.items.shift()
  }

  shuffle(): Collection<T> {
    const shuffled = [...this.items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return new Collection(shuffled)
  }

  skip(count: number): Collection<T> {
    return new Collection(this.items.slice(count))
  }

  skipUntil(callback: (item: T, index: number) => boolean): Collection<T> {
    return new Collection(this.items.slice(this.items.findIndex(callback)))
  }

  skipWhile(callback: (item: T, index: number) => boolean): Collection<T> {
    return new Collection(
      this.items.slice(this.items.findIndex((item, index) => !callback(item, index)))
    )
  }

  slice(start: number, end: number): Collection<T> {
    return new Collection(this.items.slice(start, end))
  }

  sliding(size: number, step: number): Collection<T[]> {
    const chunks: T[][] = []
    for (let i = 0; i < this.items.length; i += step) {
      chunks.push(this.items.slice(i, i + size))
    }
    return new Collection(chunks)
  }

  sole(): T {
    if (this.items.length !== 1) {
      throw new Error('Expected exactly one item')
    }
    return this.items[0]
  }

  some(callback: (item: T) => boolean): boolean {
    return this.items.some(callback)
  }

  sort(callback: (a: T, b: T) => number): Collection<T> {
    return new Collection([...this.items].sort(callback))
  }

  sortBy<K extends keyof T>(key: K): Collection<T> {
    return new Collection([...this.items].sort((a, b) => (a[key] > b[key] ? 1 : -1)))
  }

  sortDesc(callback: (a: T, b: T) => number): Collection<T> {
    return new Collection([...this.items].sort((a, b) => -callback(a, b)))
  }

  sortKeys(): Collection<T> {
    return new Collection([...this.items].sort())
  }

  sortKeysDesc(): Collection<T> {
    return new Collection([...this.items].sort().reverse())
  }

  sortKeysUsing(callback: (a: T, b: T) => number): Collection<T> {
    return new Collection([...this.items].sort(callback))
  }

  splice(start: number, deleteCount: number, ...values: T[]): Collection<T> {
    const copy = [...this.items]
    copy.splice(start, deleteCount, ...values)
    return new Collection(copy)
  }

  split(size: number): Collection<T[]> {
    const chunks: T[][] = []
    for (let i = 0; i < this.items.length; i += size) {
      chunks.push(this.items.slice(i, i + size))
    }
    return new Collection(chunks)
  }

  splitIn(size: number): Collection<T[]> {
    const chunks: T[][] = []
    for (let i = 0; i < this.items.length; i += size) {
      chunks.push(this.items.slice(i, i + size))
    }
    return new Collection(chunks)
  }

  sum(callback: (item: T) => number): number {
    return this.items.reduce((acc, item) => acc + callback(item), 0)
  }

  take(count: number): Collection<T> {
    return new Collection(this.items.slice(0, count))
  }

  takeUntil(callback: (item: T, index: number) => boolean): Collection<T> {
    return new Collection(this.items.slice(0, this.items.findIndex(callback)))
  }

  takeWhile(callback: (item: T, index: number) => boolean): Collection<T> {
    return new Collection(
      this.items.slice(
        0,
        this.items.findIndex((item, index) => !callback(item, index))
      )
    )
  }

  tap(callback: (collection: Collection<T>) => void): Collection<T> {
    callback(this)
    return this
  }

  times(count: number): Collection<T> {
    return new Collection([...Array(count)].map(() => this.items).flat())
  }

  toArray(): T[] {
    return this.items
  }

  toJson(): string {
    return JSON.stringify(this.items)
  }

  transform<U>(callback: (collection: Collection<T>) => U): U {
    return callback(this)
  }

  undot(): T {
    return this.items[0]
  }

  union(values: T[]): Collection<T> {
    const unionItems = this.items.concat(values)
    return new Collection(unionItems)
  }

  unique(callback?: (item: T) => unknown): Collection<T> {
    const uniqueItems = callback
      ? this.items.filter(
          (item, index, self) => self.findIndex((i) => callback(i) === callback(item)) === index
        )
      : Array.from(new Set(this.items))
    return new Collection(uniqueItems)
  }

  uniqueStrict(): Collection<T> {
    return new Collection([...new Set(this.items)])
  }

  unless(condition: boolean, callback: (collection: Collection<T>) => void): Collection<T> {
    if (!condition) {
      callback(this)
    }
    return this
  }

  unlessEmpty(callback: (collection: Collection<T>) => void): Collection<T> {
    if (this.items.length === 0) {
      callback(this)
    }
    return this
  }

  unlessNotEmpty(callback: (collection: Collection<T>) => void): Collection<T> {
    if (this.items.length > 0) {
      callback(this)
    }
    return this
  }

  unwrap(): T {
    return this.items[0]
  }

  value(): T {
    return this.items[0]
  }

  values(): T[] {
    return Object.values(this.items)
  }

  when(condition: boolean, callback: (collection: Collection<T>) => void): Collection<T> {
    if (condition) {
      callback(this)
    }
    return this
  }

  whenEmpty(callback: (collection: Collection<T>) => void): Collection<T> {
    if (this.items.length === 0) {
      callback(this)
    }
    return this
  }

  whenNotEmpty(callback: (collection: Collection<T>) => void): Collection<T> {
    if (this.items.length > 0) {
      callback(this)
    }
    return this
  }

  where<K extends keyof T>(key: K, value: T[K]): Collection<T> {
    return new Collection(this.items.filter((item) => item[key] === value))
  }

  whereStrict<K extends keyof T>(key: K, value: T[K]): Collection<T> {
    return new Collection(this.items.filter((item) => item[key] === value))
  }

  whereBetween<K extends keyof T>(key: K, min: T[K], max: T[K]): Collection<T> {
    return new Collection(this.items.filter((item) => item[key] >= min && item[key] <= max))
  }

  whereIn<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
    return new Collection(this.items.filter((item) => values.includes(item[key])))
  }

  whereInStrict<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
    return new Collection(this.items.filter((item) => values.includes(item[key])))
  }

  whereInstanceOf<U>(classType: new () => U): Collection<U> {
    return new Collection(this.items.filter((item) => item instanceof classType) as unknown as U[])
  }

  whereNotBetween<K extends keyof T>(key: K, min: T[K], max: T[K]): Collection<T> {
    return new Collection(this.items.filter((item) => item[key] < min || item[key] > max))
  }

  whereNotIn<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
    return new Collection(this.items.filter((item) => !values.includes(item[key])))
  }

  whereNotInStrict<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
    return new Collection(this.items.filter((item) => !values.includes(item[key])))
  }

  whereNotNull<K extends keyof T>(key: K): Collection<T> {
    return new Collection(
      this.items.filter((item) => item[key] !== null && item[key] !== undefined)
    )
  }

  whereNull<K extends keyof T>(key: K): Collection<T> {
    return new Collection(
      this.items.filter((item) => item[key] === null || item[key] === undefined)
    )
  }

  wrap(): Collection<T[]> {
    return new Collection([this.items])
  }

  zip<U>(values: U[]): Collection<[T, U]> {
    const zipped: [T, U][] = []
    for (let i = 0; i < this.items.length; i++) {
      zipped.push([this.items[i], values[i]])
    }
    return new Collection(zipped)
  }
}

function collect<T>(items: T[] = []): Collection<T> {
  return new Collection(items)
}

export { collect }
