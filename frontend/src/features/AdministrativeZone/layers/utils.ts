import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@features/Map/constants'
import GeoJSON from 'ol/format/GeoJSON'
import VectorImageLayer from 'ol/layer/VectorImage'
import { all, tile as tileStrategy } from 'ol/loadingstrategy'
import VectorSource from 'ol/source/Vector'
import { createXYZ } from 'ol/tilegrid'

import { getAdministrativeLayerStyle } from './styles/administrativeLayer.style'
import { getAdministrativeZoneFromAPI } from '../../../api/geoserver'

import type Feature from 'ol/Feature'
import type Geometry from 'ol/geom/Geometry'

export const getVectorOLLayer = (
  type: string,
  zone: string | undefined
): VectorImageLayer<VectorSource<Feature<Geometry>>> => {
  const layer = new VectorImageLayer({
    className: 'administrative',
    declutter: true,
    source: getVectorSource(type, zone),
    style: feature => [getAdministrativeLayerStyle(type)(feature as Feature)]
  })

  layer.setProperties({ code: getLayerNameFromTypeAndZone(type, zone) })

  return layer
}

const getVectorSource = (type: string, zone: string | undefined): VectorSource => {
  if (zone) {
    return buildWholeVectorSource(type, zone)
  }

  return buildBBOXVectorSource(type, zone)
}

function buildWholeVectorSource(type: string, zone: string | undefined): VectorSource<Feature<Geometry>> {
  const vectorSource = new VectorSource<Feature<Geometry>>({
    format: new GeoJSON<Feature<Geometry>>({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    strategy: all
  })

  getAdministrativeZoneFromAPI(type, undefined, zone).then(administrativeZoneFeature => {
    const features = vectorSource.getFormat()?.readFeatures(administrativeZoneFeature)
    if (!features) {
      return
    }

    vectorSource.addFeatures(features)
  })

  return vectorSource
}

/**
 * Zones are downloaded by tiles: moving the map only downloads the tiles not yet downloaded (instead of the whole
 * visible extent), and the same URLs can be cached.
 * Capped at a low zoom level, so zooming in reuses the same tiles (tiles of different levels are never considered
 * as included in one another by OpenLayers, due to floating point errors).
 */
const ADMINISTRATIVE_ZONES_TILE_GRID = createXYZ({ maxZoom: 6, tileSize: 512 })

function buildBBOXVectorSource(type: string, zone: string | undefined): VectorSource<Feature<Geometry>> {
  const vectorSource = new VectorSource<Feature<Geometry>>({
    format: new GeoJSON<Feature<Geometry>>({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    loader: extent => {
      getAdministrativeZoneFromAPI(type, extent, zone)
        .then(administrativeZone => {
          // Features overlapping several tiles are only added once, as they have the same id
          const features = vectorSource.getFormat()?.readFeatures(administrativeZone)
          if (!features) {
            return
          }

          vectorSource.addFeatures(features)
        })
        .catch(() => {
          vectorSource.removeLoadedExtent(extent)
        })
    },
    strategy: tileStrategy(ADMINISTRATIVE_ZONES_TILE_GRID)
  })

  return vectorSource
}

export function getLayerNameFromTypeAndZone(type: string, zone: string | undefined): string {
  if (!zone) {
    return type
  }

  return `${type}:${zone}`
}
