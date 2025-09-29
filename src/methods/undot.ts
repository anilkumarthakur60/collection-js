export function undot<T>(items: T[]): Record<string, unknown> {
  const expandDot = (obj: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      const parts = key.split('.')
      let current = result
      for (let i = 0; i < parts.length - 1; i++) {
        if (!(parts[i] in current) || typeof current[parts[i]] !== 'object') {
          current[parts[i]] = {}
        }
        current = current[parts[i]] as Record<string, unknown>
      }
      current[parts[parts.length - 1]] = value
    }
    return result
  }

  const merged: Record<string, unknown> = {}
  for (const item of items) {
    if (typeof item === 'object' && item !== null) {
      Object.assign(merged, item)
    }
  }

  return expandDot(merged)
}
