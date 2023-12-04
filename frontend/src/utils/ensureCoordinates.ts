import type { Coordinates } from '@mtes-mct/monitor-ui'

export function ensureCoordinates(value: any): Coordinates {
  if (Array.isArray(value) && typeof value[0] === 'number' && typeof value[1] === 'number') {
    return [value[0], value[1]]
  }

  throw new Error(`Invalid coordinates: ${value}`)
}
