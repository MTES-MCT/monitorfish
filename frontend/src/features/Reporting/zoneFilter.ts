import { WKT } from 'ol/format'
import { type Geometry, MultiPolygon, Polygon } from 'ol/geom'

const wktFormat = new WKT()

/**
 * The zone filter is a single WKT MULTIPOLYGON, each of its polygons being one of the zones drawn by the user.
 */
export function readZonesFromWKT(zoneFilter: string | undefined): Polygon[] {
  if (!zoneFilter) {
    return []
  }

  return readZonesFromGeometry(wktFormat.readGeometry(zoneFilter))
}

export function readZonesFromGeometry(geometry: Geometry): Polygon[] {
  if (geometry instanceof MultiPolygon) {
    return geometry.getPolygons()
  }
  if (geometry instanceof Polygon) {
    return [geometry]
  }

  return []
}

export function addZones(zoneFilter: string | undefined, zones: Polygon[]): string | undefined {
  return toZoneFilterWKT([...readZonesFromWKT(zoneFilter), ...zones])
}

export function removeZoneAt(zoneFilter: string | undefined, index: number): string | undefined {
  return toZoneFilterWKT(readZonesFromWKT(zoneFilter).filter((_, zoneIndex) => zoneIndex !== index))
}

function toZoneFilterWKT(zones: Polygon[]): string | undefined {
  if (!zones.length) {
    return undefined
  }

  return wktFormat.writeGeometry(new MultiPolygon(zones.map(zone => zone.getCoordinates())))
}
