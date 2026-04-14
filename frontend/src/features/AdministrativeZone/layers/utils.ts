import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@features/Map/constants'
import GeoJSON from 'ol/format/GeoJSON'
import VectorImageLayer from 'ol/layer/VectorImage'
import { all, bbox as bboxStrategy } from 'ol/loadingstrategy'
import VectorSource from 'ol/source/Vector'

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
  const vectorSource = new VectorSource({
    format: new GeoJSON({
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

    vectorSource.addFeatures(features as Feature[])
  })

  return vectorSource
}

function buildBBOXVectorSource(type: string, zone: string | undefined): VectorSource<Feature<Geometry>> {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    loader: extent => {
      getAdministrativeZoneFromAPI(type, extent, zone)
        .then(administrativeZone => {
          vectorSource.clear(true)
          const features = vectorSource.getFormat()?.readFeatures(administrativeZone)
          if (!features) {
            return
          }

          vectorSource.addFeatures(features as Feature[])
        })
        .catch(() => {
          vectorSource.removeLoadedExtent(extent)
        })
    },
    strategy: bboxStrategy
  })

  return vectorSource
}

export function getLayerNameFromTypeAndZone(type: string, zone: string | undefined): string {
  if (!zone) {
    return type
  }

  return `${type}:${zone}`
}
