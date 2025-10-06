export type FlattenType<T> = T extends (infer U)[] ? FlattenType<U> : T

export type PlainObject = Record<string, unknown>

export type Scalar = string | number | boolean | symbol | null

export type Operator = '=' | '==' | '===' | '!=' | '<>' | '!==' | '<' | '<=' | '>' | '>='

export type SortDirection = 'asc' | 'desc'
