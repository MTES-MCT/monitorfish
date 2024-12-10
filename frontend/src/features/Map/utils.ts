import { monitorfishMap } from '@features/Map/monitorfishMap'
import { FrontendError } from '@libs/FrontendError'
import { GeoJSON } from 'ol/format'

import {
  LayerProperties,
  LayerType,
  OPENLAYERS_PROJECTION,
  OpenLayersGeometryType,
  WSG84_PROJECTION
} from './constants'

import type { GeoJSON as GeoJSONType } from '../../domain/types/GeoJSON'
import type { MonitorFishMap } from '@features/Map/Map.types'
import type { MultiPolygon, Polygon } from 'ol/geom'
import type Geometry from 'ol/geom/Geometry'

/**
 *
 * @param {Object} baseMap
 * @param { String } baseMap.type
 * @param { String | null } baseMap.topic
 * @param { String | null } baseMap.zone
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

export function layerOfTypeAdministrativeLayer(administrativeLayers: MonitorFishMap.ShowableLayer[], layer) {
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
  .filter((layer): layer is MonitorFishMap.ShowableLayer => layer !== undefined)
  .filter(layer => layer.type === LayerType.ADMINISTRATIVE)

export const hoverableLayerCodes = Object.keys(LayerProperties)
  .map(layer => LayerProperties[layer])
  .filter((layer): layer is MonitorFishMap.ShowableLayer => layer !== undefined)
  .filter(layer => layer.isHoverable)
  .map(layer => layer.code)

export const clickableLayerCodes = Object.keys(LayerProperties)
  .map(layer => LayerProperties[layer])
  .filter((layer): layer is MonitorFishMap.ShowableLayer => layer !== undefined)
  .filter(layer => layer.isClickable)
  .map(layer => layer.code)

export function getMapResolution(): number {
  const resolution = monitorfishMap.getView().getResolution()

  if (!resolution) {
    throw new FrontendError('Map resolution is undefined')
  }

  return resolution
}

export function getMapZoom(): number {
  const zoom = monitorfishMap.getView().getZoom()

  if (!zoom) {
    throw new FrontendError('Map zoom is undefined')
  }

  return zoom
}
