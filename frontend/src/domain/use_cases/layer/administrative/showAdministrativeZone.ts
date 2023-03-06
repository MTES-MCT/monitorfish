import GeoJSON from 'ol/format/GeoJSON'
import VectorImageLayer from 'ol/layer/VectorImage'
import { all, bbox as bboxStrategy } from 'ol/loadingstrategy'
import VectorSource from 'ol/source/Vector'

import { getLayerNameFromTypeAndZone } from './utils'
import { getAdministrativeZoneFromAPI } from '../../../../api/geoserver'
import { getAdministrativeLayerStyle } from '../../../../features/map/layers/styles/administrativeLayer.style'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../entities/map/constants'
import LayerSlice from '../../../shared_slices/Layer'

import type Feature from 'ol/Feature'
import type Geometry from 'ol/geom/Geometry'

const DEFAULT_NAMESPACE = 'homepage'

type AdministrativeZoneRequest = {
  namespace: string
  type: string
  zone: string | null
}
export const showAdministrativeZone = (zoneRequest: AdministrativeZoneRequest) => dispatch => {
  const currentNamespace = zoneRequest.namespace || DEFAULT_NAMESPACE
  const { addShowedLayer } = LayerSlice[currentNamespace].actions

  dispatch(addShowedLayer(zoneRequest))
}

export const getVectorOLLayer = (
  type: string,
  zone: string,
  isBackoffice: boolean
): VectorImageLayer<VectorSource<Geometry>> => {
  const layer = new VectorImageLayer({
    className: 'administrative',
    declutter: true,
    source: getVectorSource(type, zone, isBackoffice),
    style: feature => [getAdministrativeLayerStyle(type)(feature as Feature)]
  })
  // @ts-ignore
  layer.name = getLayerNameFromTypeAndZone(type, zone)

  return layer
}

const getVectorSource = (type: string, subZone: string | null, isBackoffice): VectorSource<Geometry> => {
  if (subZone) {
    return buildWholeVectorSource(type, subZone, isBackoffice)
  }

  return buildBBOXVectorSource(type, subZone, isBackoffice)
}

function buildWholeVectorSource(type: string, subZone: string | null, isBackoffice): VectorSource<Geometry> {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    strategy: all
  })

  getAdministrativeZoneFromAPI(type, null, subZone, isBackoffice).then(administrativeZoneFeature => {
    const features = vectorSource.getFormat()?.readFeatures(administrativeZoneFeature)
    if (!features) {
      return
    }

    vectorSource.addFeatures(features as Feature[])
  })

  return vectorSource
}

function buildBBOXVectorSource(type: string, subZone: string | null, isBackoffice): VectorSource<Geometry> {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    loader: extent => {
      getAdministrativeZoneFromAPI(type, extent, subZone, isBackoffice)
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
