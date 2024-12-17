import { ItemNotFoundException } from './exceptions/ItemNotFoundException'
import { UnexpectedValueException } from './exceptions/UnexpectedValueException'
import { Iteratee, Predicate, PredicateChunkWhile, PredicateContains } from './types/main'

type FlattenType<T> = T extends (infer U)[] ? FlattenType<U> : T

export class Collection<T> {
  protected items: T[]

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
      const index = this.items.findIndex((value, idx) => predicate(value, idx))
      return index >= 0 && index < this.items.length - 1 ? this.items[index + 1] : null
    }

    const index = this.items.findIndex((i) => (strict ? i === item : i == item))
    return index >= 0 && index < this.items.length - 1 ? this.items[index + 1] : null
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

  chunkWhile(predicate: PredicateChunkWhile<T>): Collection<Collection<T>> {
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
      const key = String(iteratee(item))
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  }

  crossJoin<U>(...arrays: U[][]): Collection<(T | U)[]> {
    const result: (T | U)[][] = []

    const helper = (current: (T | U)[], depth: number) => {
      if (depth === arrays.length) {
        result.push(current)
        return
      }

      for (const value of arrays[depth]) {
        helper([...current, value], depth + 1)
      }
    }

    for (const item of this.items) {
      helper([item], 0)
    }

    return new Collection<(T | U)[]>(result)
  }

  dd(): void {
    this.dump()
    if (typeof process !== 'undefined') {
      process.exit(1)
    }
  }

  diff(other: T[] | Collection<T>): Collection<T> {
    const otherItems = other instanceof Collection ? other.items : other
    const uniqueItems = this.items.filter(
      (item) => !otherItems.some((otherItem) => this.isEqual(item, otherItem))
    )
    return new Collection(uniqueItems)
  }
  protected getArrayableItems(items: Collection<T> | T[]): T[] {
    if (items instanceof Collection) {
      return items.all()
    }
    return items
  }

  isEqual(value: T, other: T): boolean {
    if (value === other) {
      return true
    }

    if (
      typeof value !== 'object' ||
      value === null ||
      typeof other !== 'object' ||
      other === null
    ) {
      return false
    }

    const keysA = Object.keys(value)
    const keysB = Object.keys(other)

    if (keysA.length !== keysB.length) {
      return false
    }

    for (const key of keysA) {
      if (
        !keysB.includes(key) ||
        !this.isEqual(value[key as keyof T] as T, other[key as keyof T] as T)
      ) {
        return false
      }
    }

    return true
  }

  diffAssoc(values: Collection<T> | T[]): Collection<T> {
    const arrayableValues = this.getArrayableItems(values)
    const diffItems = this.items.filter(
      (item) => !arrayableValues.some((value) => this.isEqual(item, value))
    )
    return new Collection(diffItems)
  }
  diffAssocUsing(values: T[], callback: (item: T) => unknown): Collection<T> {
    const diffItems = this.items.filter(
      (item) => !values.some((value) => callback(value) === callback(item))
    )
    return new Collection(diffItems)
  }
  diffKeys(values: Collection<T> | T[]): Collection<T> {
    const otherItems = this.getArrayableItems(values).reduce(
      (acc, item) => {
        Object.keys(item as Record<string, T>).forEach((key) => {
          acc[key] = true
        })
        return acc
      },
      {} as Record<string, boolean>
    )

    const diffItems = this.items.filter(
      (item) => !Object.keys(item as Record<string, T>).some((key) => otherItems[key])
    )

    return new Collection(diffItems)
  }

  doesntContain(value: T | PredicateContains<T> | Partial<T>): boolean {
    return !this.contains(value)
  }

  dot(): Record<string, T> {
    const flatten = (obj: Record<string, T>, prefix = ''): Record<string, T> => {
      return Object.keys(obj).reduce(
        (acc, k) => {
          const pre = prefix.length ? prefix + '.' : ''
          if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flatten(obj[k] as Record<string, T>, pre + k))
          } else {
            acc[pre + k] = obj[k]
          }
          return acc
        },
        {} as Record<string, T>
      )
    }

    return this.items.reduce(
      (acc, item) => {
        if (typeof item === 'object' && item !== null) {
          Object.assign(acc, flatten(item as Record<string, T>))
        }
        return acc
      },
      {} as Record<string, T>
    )
  }

  dump(): T[] {
    console.log(this.items)
    return this.items
  }
  duplicates(key?: keyof T): Collection<T> {
    const seen = new Map<T[keyof T] | T, T>()
    const duplicates = new Set<T[keyof T] | T>()
    const result: T[] = []

    this.items.forEach((item) => {
      const value = key ? item[key] : item

      if (seen.has(value)) {
        if (!duplicates.has(value)) {
          duplicates.add(value)
          const original = seen.get(value)
          if (original) result.push(original)
        }
      } else {
        seen.set(value, item)
      }
    })

    return new Collection(result)
  }

  duplicatesStrict(key?: keyof T): Collection<T> {
    const seen = new Map<T[keyof T], T[]>()
    const result: T[] = []

    this.items.forEach((item) => {
      const value = key ? item[key] : item

      if (seen.has(value as T[keyof T])) {
        seen.get(value as T[keyof T])!.push(item)
      } else {
        seen.set(value as T[keyof T], [item])
      }
    })

    seen.forEach((items) => {
      if (items.length > 1) {
        result.push(...items)
      }
    })

    return new Collection(result)
  }

  each(callback: (item: T, index: number) => void): this {
    this.items.forEach(callback)
    return this
  }

  eachSpread(callback: (...args: T extends (infer R)[] ? R[] : T[]) => void | boolean): this {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i]
      // If the item is an array, spread it; otherwise, wrap it in an array.
      const args = Array.isArray(item) ? item : [item]
      const result = callback(...(args as T extends (infer R)[] ? R[] : T[]))
      if (result === false) {
        break
      }
    }
    return this
  }

  ensure(...types: Array<{ new (...args: T[]): T } | string>): this {
    for (const item of this.items) {
      const isValid = types.some((type) => {
        if (typeof type === 'string') {
          return typeof item === type
        }
        return item instanceof type
      })
      if (!isValid) {
        throw new UnexpectedValueException(`Item ${item} is not of the expected type(s)`)
      }
    }
    return this
  }

  every(callback: (item: T, index: number) => boolean): boolean {
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

  first(predicate?: (item: T, index: number) => boolean): T | null {
    if (predicate) {
      for (let i = 0; i < this.items.length; i++) {
        if (predicate(this.items[i], i)) {
          return this.items[i]
        }
      }
      return null
    }
    return this.items.length > 0 ? this.items[0] : null
  }
  firstOrFail(predicate?: (item: T, index: number) => boolean): T {
    if (predicate) {
      for (let i = 0; i < this.items.length; i++) {
        if (predicate(this.items[i], i)) {
          return this.items[i]
        }
      }
      throw new ItemNotFoundException('No items found that match the predicate')
    }
    if (this.items.length > 0) {
      return this.items[0]
    }
    throw new ItemNotFoundException('No items found in the collection')
  }
  firstWhere<K extends keyof T>(key: K, value?: T[K], operator: string = '==='): T | null {
    if (arguments.length === 1) {
      for (const item of this.items) {
        if (item[key]) {
          return item
        }
      }
    } else {
      for (const item of this.items) {
        if (value !== undefined && value !== null) {
          switch (operator) {
            case '===':
              if (item[key] === value) return item
              break
            case '!==':
              if (item[key] !== value) return item
              break
            case '<':
              if (item[key] < value) return item
              break
            case '<=':
              if (item[key] <= value) return item
              break
            case '>':
              if (item[key] > value) return item
              break
            case '>=':
              if (item[key] >= value) return item
              break
            // Add more operators as needed
          }
        }
      }
    }
    return null
  }
  flatMap<U>(callback: (item: T) => U[]): Collection<U> {
    const mapped = this.items.map(callback)
    const flattened = ([] as U[]).concat(...mapped)
    return new Collection(flattened)
  }

  flatten(depth: number = Infinity): Collection<FlattenType<T>> {
    const flattenHelper = (arr: unknown[], depth: number): unknown[] => {
      if (depth < 1) return arr
      return arr.reduce((acc: unknown[], val: unknown) => {
        if (Array.isArray(val) && depth > 0) {
          acc.push(...flattenHelper(val, depth - 1))
        } else {
          acc.push(val)
        }
        return acc
      }, [])
    }

    const flattenedItems = flattenHelper(this.items, depth) as FlattenType<T>[]
    return new Collection<FlattenType<T>>(flattenedItems)
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

  forget(index: number | string): Collection<T> {
    if (typeof index === 'number') {
      if (index < 0 || index >= this.items.length) {
        return new Collection(this.items)
      }
      const newItems = this.items.slice(0, index).concat(this.items.slice(index + 1))
      return new Collection(newItems)
    } else if (typeof index === 'string') {
      return new Collection(
        this.items.map((item) => {
          const itemCopy = { ...item } as Record<string, unknown>
          delete itemCopy[index]
          return itemCopy as T
        })
      )
    }
    return new Collection(this.items)
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

  join<K extends keyof T>(
    separator: string,
    keyOrCallback: K | ((item: T) => string | number | undefined)
  ): string {
    return this.items
      .map((item) => {
        if (typeof keyOrCallback === 'function') {
          // Use the callback function to derive the value
          return keyOrCallback(item)?.toString() ?? ''
        } else if (item && typeof item === 'object' && keyOrCallback in item) {
          // Use the key if it exists in the item
          return String(item[keyOrCallback])
        }
        return '' // Fallback for missing keys or invalid items
      })
      .filter((value) => value !== '') // Filter out empty strings
      .join(separator)
  }

  keyBy<K extends keyof T>(
    key: K | ((item: T, index: number) => string | number)
  ): Record<string, T> {
    const result: Record<string, T> = {}

    this.items.forEach((item, index) => {
      let keyValue: string | undefined

      if (typeof key === 'function') {
        keyValue = key(item, index)?.toString()
      } else if (item && typeof item === 'object' && key in item) {
        keyValue = item[key]?.toString()
      }

      if (keyValue) {
        result[keyValue] = item
      }
    })

    return result
  }

  keys(): (keyof T | string | number)[] {
    if (Array.isArray(this.items)) {
      // Check if it's an array of arrays or objects
      if (this.items.every((item) => Array.isArray(item))) {
        // If it's an array of arrays, return indices as keys
        return this.items.map((_, index) => index.toString())
      } else if (this.items.every((item) => typeof item === 'object' && item !== null)) {
        // If it's an array of objects, merge keys from all objects
        const mergedKeys = this.items.reduce((keys, item) => {
          if (typeof item === 'object' && item !== null) {
            return keys.concat(Object.keys(item))
          }
          return keys
        }, [] as string[])
        // Remove duplicates
        return Array.from(new Set(mergedKeys)) as (keyof T)[]
      }
    } else if (typeof this.items === 'object' && this.items !== null) {
      // If it's a single object, return its keys
      return Object.keys(this.items) as (keyof T)[]
    }
    // Otherwise, return indices for primitives
    return this.items.map((_, index) => index.toString())
  }

  last(predicate?: (item: T, index: number) => boolean, errorFn?: () => void): T | undefined {
    if (!predicate) {
      return this.items[this.items.length - 1]
    }

    for (let i = this.items.length - 1; i >= 0; i--) {
      if (predicate(this.items[i], i)) {
        return this.items[i]
      }
    }

    if (errorFn) {
      errorFn()
    }

    return undefined
  }

  make<U>(callback: (item: T, index: number, array: T[]) => U): Collection<U> {
    return new Collection(this.items.map(callback))
  }

  map<U>(callback: (item: T, index: number) => U): Collection<U> {
    return new Collection(this.items.map((item, index) => callback(item, index)))
  }

  mapInto<U>(ClassType: new (item: T) => U): Collection<U> {
    try {
      return new Collection(this.items.map((item) => new ClassType(item)))
    } catch (error) {
      throw new Error(`${ClassType.name} is not a valid constructor for the provided items.`)
    }
  }

  mapSpread<U>(callback: (...args: T extends (infer I)[] ? I[] : never) => U): Collection<U> {
    return new Collection(
      this.items.map((item) => callback(...(item as T extends (infer I)[] ? I[] : never)))
    )
  }

  mapToGroups<K extends string, V>(callback: (item: T, index: number) => [K, V]): Record<K, V[]> {
    return this.items.reduce<Record<K, V[]>>(
      (result, item, index) => {
        const [key, value] = callback(item, index)
        if (!result[key]) {
          result[key] = []
        }
        result[key].push(value)
        return result
      },
      {} as Record<K, V[]>
    )
  }

  mapWithKeys<K extends string, V>(callback: (item: T, index: number) => [K, V]): Record<K, V> {
    const result = {} as Record<K, V>
    this.items.forEach((item, index) => {
      const [key, value] = callback(item, index)
      result[key] = value
    })
    return result
  }

  max(callback?: (item: T) => number): number {
    if (callback) {
      return Math.max(...this.items.map(callback))
    }
    return Math.max(...this.items.map((item) => Number(item)))
  }

  median(callback?: (item: T) => number): number {
    const sorted = callback
      ? this.items.map(callback).sort((a, b) => a - b)
      : this.items.sort((a, b) => Number(a) - Number(b))
    const middle = Math.floor(sorted.length / 2)
    // return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]
    return sorted.length % 2 === 0
      ? (Number(sorted[middle - 1]) + Number(sorted[middle])) / 2
      : Number(sorted[middle])
  }
  merge<U>(...args: (U[] | Collection<U>)[]): Collection<T | U> {
    // Flatten all arguments into a single array
    const mergedItems = args.reduce<(T | U)[]>(
      (acc, arg) => {
        const items = arg instanceof Collection ? arg.toArray() : arg
        return acc.concat(items as (T | U)[]) // Ensure type compatibility
      },
      [...this.items] as (T | U)[]
    ) // Start with a copy of the original items

    return new Collection<T | U>(mergedItems)
  }

  mergeRecursive<U>(...values: (U[] | Collection<U>)[]): Collection<T | U> {
    const target = this.items.map(deepClone) // deep clone to avoid mutation
    const arrays = values.map((val) =>
      val instanceof Collection ? val.toArray().map(deepClone) : val.map(deepClone)
    )

    const mergedArray = arrays.reduce(
      (acc, current) => {
        return mergeArrays(acc, current)
      },
      target as (T | U)[]
    )

    return new Collection(mergedArray)

    // Helper function to deeply merge two arrays
    function mergeArrays<A>(arr1: A[], arr2: A[]): A[] {
      if (
        arr1.every((item) => typeof item !== 'object') &&
        arr2.every((item) => typeof item !== 'object')
      ) {
        // If both arrays are flat arrays of primitives, concatenate them
        return arr1.concat(arr2)
      }

      const result: A[] = []
      const maxLength = Math.max(arr1.length, arr2.length)
      for (let i = 0; i < maxLength; i++) {
        const val1 = arr1[i]
        const val2 = arr2[i]

        if (i >= arr1.length) {
          // arr1 is shorter, just push val2
          result.push(val2)
        } else if (i >= arr2.length) {
          // arr2 is shorter, just push val1
          result.push(val1)
        } else {
          // Both values exist
          result.push(mergeValues(val1, val2))
        }
      }
      return result
    }

    // Helper function to merge two values (primitives, objects, or arrays)
    function mergeValues<V>(value1: V, value2: V): V {
      // If both are arrays, merge element-wise
      if (Array.isArray(value1) && Array.isArray(value2)) {
        return mergeArrays(value1, value2) as V
      }

      // If both are objects (and not null), merge their keys
      if (isObject(value1) && isObject(value2)) {
        return mergeObjects(
          value1 as Record<string, unknown>,
          value2 as Record<string, unknown>
        ) as V
      }

      // If types differ or are primitives, overwrite with value2
      return value2
    }

    // Helper function to merge two objects deeply
    function mergeObjects(
      obj1: Record<string, unknown>,
      obj2: Record<string, unknown>
    ): Record<string, unknown> {
      const result: Record<string, unknown> = { ...obj1 }
      for (const key of Object.keys(obj2)) {
        const val1 = result[key]
        const val2 = obj2[key]

        if (Array.isArray(val1) && Array.isArray(val2)) {
          result[key] = mergeArrays(val1, val2)
        } else if (isObject(val1) && isObject(val2)) {
          result[key] = mergeObjects(
            val1 as Record<string, unknown>,
            val2 as Record<string, unknown>
          )
        } else {
          // Overwrite with val2
          result[key] = val2
        }
      }
      return result
    }

    function isObject(value: unknown): value is Record<string, unknown> {
      return value !== null && typeof value === 'object' && !Array.isArray(value)
    }

    function deepClone<T>(item: T): T {
      if (item === null || typeof item !== 'object') {
        return item
      }

      if (Array.isArray(item)) {
        return item.map(deepClone) as unknown as T
      }

      const clonedObj: Record<string, unknown> = {}
      for (const key of Object.keys(item as Record<string, unknown>)) {
        clonedObj[key] = deepClone((item as Record<string, unknown>)[key])
      }
      return clonedObj as T
    }
  }

  min(callback?: (item: T) => number): T | undefined {
    if (this.items.length === 0) {
      return undefined
    }

    if (callback) {
      let minItem: T | undefined = undefined
      let minValue = Infinity

      for (const item of this.items) {
        const value = callback(item)
        if (value < minValue) {
          minValue = value
          minItem = item
        }
      }

      return minItem
    } else {
      // Runtime type checks for non-callback scenario
      let minItem = this.items[0]
      const rest = this.items.slice(1)

      for (const item of rest) {
        if (
          (typeof item === 'number' || typeof item === 'string') &&
          (typeof minItem === 'number' || typeof minItem === 'string')
        ) {
          if (item < minItem) {
            minItem = item
          }
        } else {
          throw new Error('Items must be number or string if no callback is provided to min().')
        }
      }

      return minItem
    }
  }

  mode(callback?: (item: T) => unknown): T | undefined {
    if (this.items.length === 0) {
      return undefined
    }

    // Use a Map with string keys. We'll serialize non-primitive keys to ensure equality by value.
    const counts = new Map<string, { count: number; item: T }>()

    for (const item of this.items) {
      const keyValue = callback ? callback(item) : item
      let mapKey: string

      if (typeof keyValue === 'object' && keyValue !== null) {
        // Convert object keys to a JSON string for equality by value
        mapKey = JSON.stringify(keyValue)
      } else {
        // Primitives can just be converted to string directly
        mapKey = String(keyValue)
      }

      const entry = counts.get(mapKey)
      if (entry) {
        entry.count++
      } else {
        counts.set(mapKey, { count: 1, item })
      }
    }

    let maxCount = -Infinity
    let modeItem: T | undefined = undefined

    // Find the first highest frequency item
    for (const { count, item } of counts.values()) {
      if (count > maxCount) {
        maxCount = count
        modeItem = item
      }
    }

    return modeItem
  }

  nth(n: number): T | undefined {
    if (n < 0) {
      n = this.items.length + n
    }

    return this.items[n]
  }

  only(keys: string[]): Collection<Record<string, T[keyof T] | undefined>> {
    return new Collection(
      this.items.map((item) => {
        const copy: Record<string, T[keyof T] | undefined> = {}
        if (typeof item === 'object' && item !== null) {
          // Safe to use `in` and indexing now
          const record = item as Record<string, T[keyof T]>
          keys.forEach((key) => {
            copy[key] = key in record ? record[key] : undefined
          })
        } else {
          // If item is not an object, all requested keys become undefined
          keys.forEach((key) => {
            copy[key] = undefined
          })
        }
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

  // splice(start: number, deleteCount: number, ...values: T[]): Collection<T> {
  //   const copy = [...this.items]
  //   copy.splice(start, deleteCount, ...values)
  //   return new Collection(copy)
  // }

  splice(start: number, deleteCount: number, ...values: T[]): this {
    this.items.splice(start, deleteCount, ...values)
    return this
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

export { collect, UnexpectedValueException }
