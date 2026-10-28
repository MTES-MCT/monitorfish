import { monitorfishMap } from '@features/Map/monitorfishMap'
import { FrontendError } from '@libs/FrontendError'
import { getCoordinatesInWorldCopyOf, getExtentInWorldCopyOf, WORLD_WIDTH } from '@utils/worldCopy'
import { GeoJSON } from 'ol/format'
import { MultiPolygon } from 'ol/geom'
import Draw from 'ol/interaction/Draw'
import Modify from 'ol/interaction/Modify'
import VectorLayer from 'ol/layer/Vector'

import { AdminLayerProperties, OPENLAYERS_PROJECTION, OpenLayersGeometryType, WSG84_PROJECTION } from './constants'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type { Geometry as GeoJSONGeometry, MultiPolygon as GeoJSONMultiPolygon } from 'geojson'
import type { Coordinate } from 'ol/coordinate'
import type { Extent } from 'ol/extent'
import type { FeatureLike } from 'ol/Feature'
import type { Polygon } from 'ol/geom'
import type Geometry from 'ol/geom/Geometry'
import type OpenLayerMap from 'ol/Map'
import type { AtPixelOptions } from 'ol/Map'
import type { Pixel } from 'ol/pixel'

export const getLayerNameNormalized = layer => [layer.type, layer.topic, layer.zone].filter(Boolean).join(':')

export function convertToGeoJSONGeometryObject<T extends GeoJSONGeometry>(feature: Geometry): T {
  const format = new GeoJSON()

  return format.writeGeometryObject(feature, {
    dataProjection: WSG84_PROJECTION,
    featureProjection: OPENLAYERS_PROJECTION
  }) as T
}

export function addGeometryToMultiPolygonGeoJSON(
  multiPolygon: GeoJSONMultiPolygon,
  polygonToAdd: Geometry
): GeoJSONGeometry | undefined {
  const nextGeometry = readMultiPolygonOrEmpty(multiPolygon)

  if (
    nextGeometry.getType() === OpenLayersGeometryType.MULTIPOLYGON &&
    polygonToAdd.getType() === OpenLayersGeometryType.POLYGON
  ) {
    nextGeometry.appendPolygon(polygonToAdd as Polygon)
  }

  return convertToGeoJSONGeometryObject<GeoJSONMultiPolygon>(nextGeometry)
}

export function keepOnlyInitialGeometriesOfMultiPolygon(
  multiPolygon: GeoJSONMultiPolygon,
  initialFeatureNumber: number
): GeoJSONMultiPolygon | undefined {
  const nextGeometry = readMultiPolygonOrEmpty(multiPolygon)

  const coordinates = nextGeometry.getCoordinates()
  if (!coordinates.length) {
    return multiPolygon
  }

  const nextCoordinates = coordinates.slice(0, initialFeatureNumber)
  nextGeometry.setCoordinates(nextCoordinates)

  return convertToGeoJSONGeometryObject<GeoJSONMultiPolygon>(nextGeometry)
}

/**
 * Since OpenLayers 10.11, `readGeometry()` returns `null` for a geometry with empty coordinates,
 * which is what a reset zone drawing produces.
 */
function readMultiPolygonOrEmpty(multiPolygon: GeoJSONMultiPolygon): MultiPolygon {
  const geometry = new GeoJSON({
    featureProjection: OPENLAYERS_PROJECTION
  }).readGeometry(multiPolygon)

  return (geometry as MultiPolygon | null) ?? new MultiPolygon([])
}

export function layersNotInCurrentOLMap(olLayers, layer) {
  return !olLayers.getArray().some(layer_ => layer_.get('code') === getLayerNameNormalized(layer))
}

export function layerOfTypeAdministrativeLayer(administrativeLayers: MonitorFishMap.AdminShowableLayer[], layer) {
  return administrativeLayers.some(administrativeLayer => layer.type?.includes(administrativeLayer.code))
}

export function layerOfTypeAdministrativeLayerInCurrentMap(administrativeLayers, olLayer) {
  return administrativeLayers.some(administrativeLayer =>
    (olLayer.get('code') as string | undefined)?.includes(administrativeLayer.code)
  )
}

export function layersNotInShowedLayers(_showedLayers, olLayer) {
  const code = olLayer.get('code') as string | undefined

  return !_showedLayers.some(layer_ => getLayerNameNormalized(layer_) === code)
}

export const administrativeLayers = Object.values(AdminLayerProperties)

function getViewCenterX(): number {
  return monitorfishMap.getView().getCenter()?.[0] ?? 0
}

/** Returns the copy of `coordinates` in the world copy displayed by the map (the user may have panned around the globe). */
export function getCoordinatesInViewWorld<T extends Coordinate | undefined>(coordinates: T): T {
  if (!coordinates) {
    return coordinates
  }

  return getCoordinatesInWorldCopyOf(coordinates, getViewCenterX()) as T
}

export function getExtentInViewWorld(extent: Extent): Extent {
  return getExtentInWorldCopyOf(extent, getViewCenterX())
}

/**
 * Returns the feature at `pixel` of the layer with the highest z-index.
 * `map.forEachFeatureAtPixel()` stops at the first hit, but on a world copy OpenLayers hits canvas layers
 * (on the main world coordinate) before WebGL layers (on the displayed world copy), whatever their z-index.
 */
export function getTopmostFeatureAtPixel(
  map: OpenLayerMap,
  pixel: Pixel,
  options: AtPixelOptions
): FeatureLike | undefined {
  let topmostFeature: FeatureLike | undefined
  let topmostZIndex = -Infinity

  map.forEachFeatureAtPixel(
    pixel,
    (feature, layer) => {
      // Same defaults as OpenLayers rendering: unmanaged layers (`null`) are on top, managed ones default to 0
      const zIndex = layer ? (layer.getZIndex() ?? 0) : Infinity
      if (!topmostFeature || zIndex > topmostZIndex) {
        topmostFeature = feature
        topmostZIndex = zIndex
      }
    },
    options
  )

  return topmostFeature
}

/**
 * Moves the view back to the main world when it is 2 or more world copies away, like Leaflet's `worldCopyJump`.
 * `map.forEachFeatureAtPixel()` only hits features up to 1 world copy away from the main world.
 * Overlays and the features of non-wrapping layers follow the jump, so the rendered map stays the same.
 */
export function jumpToMainWorldIfTooFar(map: OpenLayerMap) {
  const view = map.getView()
  const center = view.getCenter()
  if (!center) {
    return
  }

  const worldIndex = Math.round(center[0]! / WORLD_WIDTH)
  if (Math.abs(worldIndex) < 2) {
    return
  }

  // A geometry being drawn or edited stays on the displayed world copy, out of reach of `Modify` after a jump
  const isDrawingOrModifying = map
    .getInteractions()
    .getArray()
    .some(interaction => (interaction instanceof Draw || interaction instanceof Modify) && interaction.getActive())
  if (isDrawingOrModifying) {
    return
  }

  const shift = -worldIndex * WORLD_WIDTH

  map.getOverlays().forEach(overlay => {
    const position = overlay.getPosition()
    if (position) {
      overlay.setPosition([position[0]! + shift, position[1]!])
    }
  })

  map.getAllLayers().forEach(layer => {
    const source = layer instanceof VectorLayer ? layer.getSource() : undefined
    if (source && !source.getWrapX()) {
      source.getFeatures().forEach(feature => feature.getGeometry()?.translate(shift, 0))
    }
  })

  view.setCenter([center[0]! + shift, center[1]!])
}

/** Moves, in place, a geometry to the world copy displayed by the map. */
export function moveGeometryToViewWorld(geometry: Geometry | undefined) {
  if (!geometry) {
    return
  }

  const extent = geometry.getExtent()
  const shift = getExtentInViewWorld(extent)[0]! - extent[0]!
  if (shift !== 0) {
    geometry.translate(shift, 0)
  }
}

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
