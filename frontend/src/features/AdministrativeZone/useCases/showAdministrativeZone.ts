import { mainMapActions } from '@features/MainMap/slice'
import GeoJSON from 'ol/format/GeoJSON'
import VectorImageLayer from 'ol/layer/VectorImage'
import { all, bbox as bboxStrategy } from 'ol/loadingstrategy'
import VectorSource from 'ol/source/Vector'

import { getLayerNameFromTypeAndZone } from './utils'
import { getAdministrativeZoneFromAPI } from '../../../api/geoserver'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../MainMap/constants'
import { getAdministrativeLayerStyle } from '../layers/styles/administrativeLayer.style'

import type { MainAppThunk } from '../../../store'
import type { MainMap } from '@features/MainMap/MainMap.types'
import type Feature from 'ol/Feature'
import type Geometry from 'ol/geom/Geometry'

export const showAdministrativeZone =
  (zoneRequest: MainMap.ShowedLayer): MainAppThunk<void> =>
  dispatch => {
    dispatch(mainMapActions.addShowedLayer(zoneRequest))
  }

export const getVectorOLLayer = (
  type: string,
  zone: string | null,
  isBackoffice: boolean
): VectorImageLayer<Feature<Geometry>> => {
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

const getVectorSource = (type: string, zone: string | null, isBackoffice): VectorSource => {
  if (zone) {
    return buildWholeVectorSource(type, zone, isBackoffice)
  }

  return buildBBOXVectorSource(type, zone, isBackoffice)
}

function buildWholeVectorSource(type: string, zone: string | null, isBackoffice): VectorSource<Feature<Geometry>> {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    strategy: all
  })

  getAdministrativeZoneFromAPI(type, null, zone, isBackoffice).then(administrativeZoneFeature => {
    const features = vectorSource.getFormat()?.readFeatures(administrativeZoneFeature)
    if (!features) {
      return
    }

    vectorSource.addFeatures(features as Feature[])
  })

  return vectorSource
}

function buildBBOXVectorSource(type: string, zone: string | null, isBackoffice): VectorSource<Feature<Geometry>> {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    loader: extent => {
      getAdministrativeZoneFromAPI(type, extent, zone, isBackoffice)
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
