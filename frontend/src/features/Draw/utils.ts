import { CoordinatesFormat, OpenLayersGeometryType } from '@features/Map/constants'

import type { GeoJsonObject, Point as GeoJSONPoint } from 'geojson'

/**
 * Number of steps per degree the CoordinatesInput display snaps to, per format: whole seconds in
 * DMS, thousandths of a minute in DMD, 6 decimal places in DD.
 */
const DISPLAY_STEPS_PER_DEGREE: Record<CoordinatesFormat, number> = {
  [CoordinatesFormat.DECIMAL_DEGREES]: 1e6,
  [CoordinatesFormat.DEGREES_MINUTES_DECIMALS]: 60 * 1e3,
  [CoordinatesFormat.DEGREES_MINUTES_SECONDS]: 3600
}

/** Snaps a coordinate in decimal degrees to the grid the given format displays it on. */
function toDisplayStep(degrees: number, coordinatesFormat: CoordinatesFormat): number {
  return Math.round(degrees * DISPLAY_STEPS_PER_DEGREE[coordinatesFormat])
}

/**
 * Detects whether coordinates received by a CoordinatesInput onChange handler are an IMask echo
 * of a programmatic update (e.g. a map click) rather than genuine manual user input.
 *
 * When drawedGeometry changes, CoordinatesInput's defaultValue updates, causing IMask to fire a
 * `complete` event that calls the onChange handler with the displayed coordinates. Those are the
 * geometry snapped to the format's display grid, so comparing both sides on that grid tells an
 * echo apart from an edit — down to the smallest change the user can actually type.
 */
export function isEchoFromMapClick(
  geometry: GeoJsonObject | null | undefined,
  latitude: number,
  longitude: number,
  coordinatesFormat: CoordinatesFormat
): boolean {
  if (geometry?.type !== OpenLayersGeometryType.POINT) {
    return false
  }

  // GeoJSON Point coordinates are always [lon, lat]
  const [geometryLon, geometryLat] = (geometry as GeoJSONPoint).coordinates as [number, number]

  return (
    toDisplayStep(geometryLat, coordinatesFormat) === toDisplayStep(latitude, coordinatesFormat) &&
    toDisplayStep(geometryLon, coordinatesFormat) === toDisplayStep(longitude, coordinatesFormat)
  )
}

/** Returns GeoJSON Point coordinates as [latitude, longitude] (swapping from GeoJSON's [lon, lat]). */
export function swapToLatLon(geometry: GeoJSONPoint): [number, number] {
  const [lon, lat] = geometry.coordinates as [number, number]

  return [lat, lon]
}

/**
 * Rounds [lat, lon] to at most 6 decimal places, eliminating floating-point noise
 * from the WGS84 ↔ OpenLayers projection round-trip before passing coordinates to
 * the DD CoordinatesInput (which pads with zeros above 6 decimal places).
 */
export function roundCoordinates([lat, lon]: [number, number]): [number, number] {
  return [Number.parseFloat(lat.toFixed(6)), Number.parseFloat(lon.toFixed(6))]
}
