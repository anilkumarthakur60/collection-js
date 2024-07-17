export type Collection<T, U> = {
  predicate: (val: T) => boolean
  action: () => U
}
