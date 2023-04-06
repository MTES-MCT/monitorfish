import { GeoJSON } from 'ol/format'

import { LayerProperties, LayerType } from './constants'
import { OpenLayersGeometryType, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../map/constants'

import type { ShowableLayer } from './types'
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

  if (
    nextGeometry.getType() === OpenLayersGeometryType.MULTIPOLYGON &&
    polygonToAdd.getType() === OpenLayersGeometryType.POLYGON
  ) {
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

export function layersNotInCurrentOLMap(olLayers, layer) {
  return !olLayers.getArray().some(layer_ => layer_.name === getLayerNameNormalized(layer))
}

export function layerOfTypeAdministrativeLayer(administrativeLayers: ShowableLayer[], layer) {
  return administrativeLayers.some(administrativeLayer => layer.type?.includes(administrativeLayer.code))
}

export function layerOfTypeAdministrativeLayerInCurrentMap(administrativeLayers, olLayer) {
  return administrativeLayers.some(administrativeLayer => olLayer.name?.includes(administrativeLayer.code))
}

export function layersNotInShowedLayers(_showedLayers, olLayer) {
  return !_showedLayers.some(layer_ => getLayerNameNormalized(layer_) === olLayer.name)
}

export const administrativeLayers = Object.keys(LayerProperties)
  .map(layer => LayerProperties[layer])
  .filter((layer): layer is ShowableLayer => layer !== undefined)
  .filter(layer => layer.type === LayerType.ADMINISTRATIVE)

export const hoverableLayerCodes = Object.keys(LayerProperties)
  .map(layer => LayerProperties[layer])
  .filter((layer): layer is ShowableLayer => layer !== undefined)
  .filter(layer => layer.isHoverable)
  .map(layer => layer.code)

export const clickableLayerCodes = Object.keys(LayerProperties)
  .map(layer => LayerProperties[layer])
  .filter((layer): layer is ShowableLayer => layer !== undefined)
  .filter(layer => layer.isClickable)
  .map(layer => layer.code)
