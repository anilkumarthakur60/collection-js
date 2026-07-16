export interface CsvParseOptions {
  delimiter?: string
  /** Treat the first row as the header. When true, returns objects keyed by header. */
  header?: boolean
  /** Quote character — `"` by default. Pass empty string to disable quoting. */
  quote?: string
  /** When true, all values stay as strings; otherwise simple numbers/bools are coerced. */
  raw?: boolean
}

export interface CsvSerializeOptions {
  /** Optional explicit column order. When omitted, keys are taken from the first row. */
  columns?: readonly string[]
  delimiter?: string
  /** EOL sequence — defaults to \n. Use \r\n if Excel compat matters. */
  eol?: string
  /** Include the header row at the top of the output. Default true when input is objects. */
  header?: boolean
}

/**
 * RFC 4180-compatible CSV parser. Handles quoted fields with embedded
 * delimiters, escaped quotes (`""`), and \r\n / \n line endings. Returns
 * either string[][] (when `header` is false) or `Record<string, string>[]`.
 */
export function parseCsv(
  input: string,
  options: CsvParseOptions = {}
): string[][] | Record<string, string | number | boolean | null>[] {
  const delimiter = options.delimiter ?? ','
  const quote = options.quote ?? '"'
  const useQuote = quote.length > 0

  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0

  while (i < input.length) {
    const ch = input[i]
    if (inQuotes) {
      if (useQuote && ch === quote) {
        if (input[i + 1] === quote) {
          field += quote
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += ch
      i++
      continue
    }
    if (useQuote && ch === quote && field === '') {
      inQuotes = true
      i++
      continue
    }
    if (ch === delimiter) {
      row.push(field)
      field = ''
      i++
      continue
    }
    if (ch === '\r') {
      if (input[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    field += ch
    i++
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  if (!options.header) return rows
  if (rows.length === 0) return []
  const [headerRow, ...rest] = rows
  return rest.map((r) => {
    const obj: Record<string, string | number | boolean | null> = {}
    for (let j = 0; j < headerRow.length; j++) {
      obj[headerRow[j]] = options.raw ? (r[j] ?? '') : coerce(r[j] ?? '')
    }
    return obj
  })
}

function coerce(value: string): string | number | boolean | null {
  if (value === '') return ''
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return value
}

/**
 * Serialize an array of objects (or rows) to a CSV string. Values that
 * contain the delimiter, a quote, or a newline are quoted; embedded quotes
 * are escaped by doubling.
 */
export function toCsv(
  rows: ReadonlyArray<Record<string, unknown>> | ReadonlyArray<readonly unknown[]>,
  options: CsvSerializeOptions = {}
): string {
  const delimiter = options.delimiter ?? ','
  const eol = options.eol ?? '\n'
  if (rows.length === 0) return ''

  const isObjectRow = !Array.isArray(rows[0])
  const out: string[] = []

  if (isObjectRow) {
    const objectRows = rows as ReadonlyArray<Record<string, unknown>>
    const columns = options.columns ?? collectColumns(objectRows)
    if (options.header !== false)
      out.push(columns.map((c) => csvField(c, delimiter)).join(delimiter))
    for (const row of objectRows) {
      out.push(columns.map((c) => csvField(stringify(row[c]), delimiter)).join(delimiter))
    }
  } else {
    const arrayRows = rows as ReadonlyArray<readonly unknown[]>
    if (options.columns && options.header !== false) {
      out.push(options.columns.map((c) => csvField(c, delimiter)).join(delimiter))
    }
    for (const row of arrayRows) {
      out.push(row.map((v) => csvField(stringify(v), delimiter)).join(delimiter))
    }
  }
  return out.join(eol)
}

function collectColumns(rows: ReadonlyArray<Record<string, unknown>>): string[] {
  const seen = new Set<string>()
  for (const row of rows) for (const k of Object.keys(row)) seen.add(k)
  return [...seen]
}

function stringify(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

function csvField(value: string, delimiter: string): string {
  if (
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
