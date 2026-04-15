import { OpenLayersGeometryType } from '@features/Map/constants'

import type { GeoJsonObject, Point as GeoJSONPoint } from 'geojson'

// Tolerance in decimal degrees for detecting a programmatic IMask echo vs. genuine user input.
// DMS seconds are integer-rounded, so round-trip error can reach up to 0.5/3600 ≈ 0.000139°.
export const DMS_ROUNDTRIP_TOLERANCE = 0.001

/**
 * Detects whether coordinates received by a CoordinatesInput onChange handler are an IMask echo
 * of a programmatic update (e.g. a map click) rather than genuine manual user input.
 *
 * When drawedGeometry changes, CoordinatesInput's defaultValue updates, causing IMask to fire a
 * `complete` event that calls the onChange handler with the same coordinates. Comparing against
 * the current geometry lets callers skip redundant fitToExtent dispatches in that case.
 */
export function isEchoFromMapClick(
  geometry: GeoJsonObject | null | undefined,
  latitude: number,
  longitude: number
): boolean {
  if (geometry?.type !== OpenLayersGeometryType.POINT) {
    return false
  }

  // GeoJSON Point coordinates are always [lon, lat]
  const [geometryLon, geometryLat] = (geometry as GeoJSONPoint).coordinates as [number, number]

  return (
    Math.abs(geometryLat - latitude) < DMS_ROUNDTRIP_TOLERANCE &&
    Math.abs(geometryLon - longitude) < DMS_ROUNDTRIP_TOLERANCE
  )
}

/** Returns GeoJSON Point coordinates as [latitude, longitude] (swapping from GeoJSON's [lon, lat]). */
export function swapToLatLon(geometry: GeoJSONPoint): [number, number] {
  const [lon, lat] = geometry.coordinates as [number, number]

  return [lat, lon]
}
