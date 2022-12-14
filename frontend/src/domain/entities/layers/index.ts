import { GeoJSON } from 'ol/format'

import { OLGeometryType, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../map/constants'

import type { GeoJSON as GeoJSONType } from '../../types/GeoJSON'
import type { MultiPolygon, Polygon } from 'ol/geom'
import type Geometry from 'ol/geom/Geometry'

/**
 *
 * @param {Object} layer
 * @param { String } layer.type
 * @param { String | null } layer.topic
 * @param { String | null } layer.zone
 * @returns String
 */
export const getLayerNameNormalized = layer => [layer.type, layer.topic, layer.zone].filter(Boolean).join(':')

export function convertToGeoJSONGeometryObject(feature: Geometry): GeoJSONType.Geometry {
  const format = new GeoJSON()

  return format.writeGeometryObject(feature, {
    dataProjection: WSG84_PROJECTION,
    featureProjection: OPENLAYERS_PROJECTION
  })
}

export function addGeometryToMultiPolygonGeoJSON(
  multiPolygon: GeoJSONType.Geometry,
  polygonToAdd: Geometry
): GeoJSONType.Geometry | undefined {
  const nextGeometry = new GeoJSON({
    featureProjection: OPENLAYERS_PROJECTION
  }).readGeometry(multiPolygon)

  if (!nextGeometry) {
    return undefined
  }

  if (nextGeometry.getType() === OLGeometryType.MULTIPOLYGON && polygonToAdd.getType() === OLGeometryType.POLYGON) {
    ;(nextGeometry as MultiPolygon).appendPolygon(polygonToAdd as Polygon)
  }

  return convertToGeoJSONGeometryObject(nextGeometry)
}

export function keepOnlyInitialGeometriesOfMultiPolygon(
  multiPolygon: GeoJSONType.Geometry,
  initialFeatureNumber: number
): GeoJSONType.Geometry | undefined {
  const nextGeometry = new GeoJSON({
    featureProjection: OPENLAYERS_PROJECTION
  }).readGeometry(multiPolygon) as MultiPolygon

  const coordinates = nextGeometry.getCoordinates()
  if (!coordinates?.length) {
    return multiPolygon
  }

  const nextCoordinates = coordinates.slice(0, initialFeatureNumber)
  nextGeometry?.setCoordinates(nextCoordinates)

  return convertToGeoJSONGeometryObject(nextGeometry)
}
