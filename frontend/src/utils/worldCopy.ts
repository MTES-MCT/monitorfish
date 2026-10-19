import { OPENLAYERS_PROJECTION } from '@features/Map/constants'
import { getCenter, getWidth } from 'ol/extent'
import { MultiPolygon } from 'ol/geom'
import { get } from 'ol/proj'

import type { Coordinate } from 'ol/coordinate'
import type { Extent } from 'ol/extent'
import type { Geometry, Polygon } from 'ol/geom'

/**
 * Width of a world in OPENLAYERS_PROJECTION.
 * The map wraps around the globe: every feature is also rendered on world copies shifted by this width.
 */
export const WORLD_WIDTH = getWidth(get(OPENLAYERS_PROJECTION)!.getExtent())

function getWorldShiftTowards(x: number, referenceX: number): number {
  return Math.round((referenceX - x) / WORLD_WIDTH) * WORLD_WIDTH
}

/**
 * Returns the copy of `coordinates` nearest to `referenceX` (e.g. the view center),
 * so that an overlay or an animation targets the world copy the user is looking at.
 */
export function getCoordinatesInWorldCopyOf(coordinates: Coordinate, referenceX: number): Coordinate {
  const [x, ...rest] = coordinates

  return [x! + getWorldShiftTowards(x!, referenceX), ...rest]
}

/** Returns the copy of `coordinates` in the main world, i.e. with a longitude within [-180°, 180°]. */
export function getCoordinatesInMainWorld(coordinates: Coordinate): Coordinate {
  return getCoordinatesInWorldCopyOf(coordinates, 0)
}

export function getExtentInWorldCopyOf(extent: Extent, referenceX: number): Extent {
  const [minX, minY, maxX, maxY] = extent
  const shift = getWorldShiftTowards(getCenter(extent)[0]!, referenceX)

  return [minX! + shift, minY!, maxX! + shift, maxY!]
}

function translateToMainWorld(geometry: Geometry) {
  const shift = getWorldShiftTowards(getCenter(geometry.getExtent())[0]!, 0)
  if (shift !== 0) {
    geometry.translate(shift, 0)
  }
}

/**
 * Moves, in place, a geometry drawn on a world copy back to the main world, so that it is saved
 * with longitudes within [-180, 180]. A zone crossing the antimeridian is kept contiguous (e.g. 170° to 190°).
 */
export function moveGeometryToMainWorld<T extends Geometry>(geometry: T): T {
  if (geometry instanceof MultiPolygon) {
    const polygons = geometry.getPolygons()
    polygons.forEach(translateToMainWorld)
    geometry.setCoordinates(polygons.map((polygon: Polygon) => polygon.getCoordinates()))

    return geometry
  }

  translateToMainWorld(geometry)

  return geometry
}
