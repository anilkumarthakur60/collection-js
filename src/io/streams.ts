import { AsyncCollection } from '../async/AsyncCollection'

/**
 * Adapter for any Node `Readable` (or ReadableStream) that implements
 * `AsyncIterable`. Buffers are decoded with UTF-8 by default; binary streams
 * pass `decodeAs: undefined` to keep raw chunks.
 */
export interface ReadableLike<T> {
  [Symbol.asyncIterator](): AsyncIterator<T>
}

export interface FromReadableOptions {
  /**
   * Decode each chunk as text using the given encoding, or pass `false` to
   * keep raw byte chunks (yields stringified buffers — caller likely wants a
   * different signature in that case). Defaults to `'utf-8'`.
   */
  decodeAs?: 'utf8' | 'utf-8' | 'ascii' | 'latin1' | false
}

/**
 * Wrap a Node `Readable` (or any `AsyncIterable<Buffer | Uint8Array | string>`)
 * into an `AsyncCollection<string>`. Pass `{decodeAs: false}` to skip decoding.
 */
export function fromReadable(
  source: ReadableLike<Buffer | Uint8Array | string>,
  options: FromReadableOptions = {}
): AsyncCollection<string> {
  const encoding = options.decodeAs === false ? null : (options.decodeAs ?? 'utf-8')
  const decoder = encoding ? new TextDecoder(encoding) : null
  return new AsyncCollection<string>(async function* () {
    for await (const chunk of source as AsyncIterable<Buffer | Uint8Array | string>) {
      if (typeof chunk === 'string') yield chunk
      else if (decoder) yield decoder.decode(chunk as Uint8Array, { stream: true })
      else yield String(chunk)
    }
    if (decoder) {
      const tail = decoder.decode()
      if (tail.length > 0) yield tail
    }
  })
}

/**
 * Convert an arbitrary chunk stream into a line-by-line `AsyncCollection<string>`.
 * Handles \n and \r\n; trailing chunk without newline is emitted as the last line.
 */
export function lines(source: ReadableLike<Buffer | Uint8Array | string>): AsyncCollection<string> {
  return new AsyncCollection<string>(async function* () {
    let buffer = ''
    const decoder = new TextDecoder('utf-8')
    for await (const chunk of source as AsyncIterable<Buffer | Uint8Array | string>) {
      buffer +=
        typeof chunk === 'string' ? chunk : decoder.decode(chunk as Uint8Array, { stream: true })
      let idx: number
      while ((idx = buffer.indexOf('\n')) >= 0) {
        yield buffer.slice(0, idx).replace(/\r$/, '')
        buffer = buffer.slice(idx + 1)
      }
    }
    const tail = buffer + decoder.decode()
    if (tail.length > 0) yield tail
  })
}
