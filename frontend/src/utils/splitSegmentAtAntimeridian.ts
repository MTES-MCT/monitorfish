import type { Coordinates } from '@mtes-mct/monitor-ui'

/**
 * Splits a WGS84 segment crossing the antimeridian (±180° longitude) into two segments,
 * the first one ending at the antimeridian and the second one starting on the opposite side,
 * so that no segment is drawn across the whole world width.
 *
 * Returns the original segment untouched when it does not cross the antimeridian.
 */
export function splitSegmentAtAntimeridian(start: Coordinates, end: Coordinates): Array<[Coordinates, Coordinates]> {
  const [startLongitude, startLatitude] = start
  const [endLongitude, endLatitude] = end

  const isCrossingAntimeridian = Math.abs(endLongitude - startLongitude) > 180
  if (!isCrossingAntimeridian) {
    return [[start, end]]
  }

  const edgeLongitude = startLongitude > 0 ? 180 : -180
  const unwrappedEndLongitude = endLongitude + (startLongitude > 0 ? 360 : -360)
  const longitudeDelta = unwrappedEndLongitude - startLongitude
  const latitudeAtCrossing =
    longitudeDelta === 0
      ? startLatitude
      : startLatitude + ((endLatitude - startLatitude) * (edgeLongitude - startLongitude)) / longitudeDelta

  return [
    [start, [edgeLongitude, latitudeAtCrossing]],
    [[-edgeLongitude, latitudeAtCrossing], end]
  ]
}
