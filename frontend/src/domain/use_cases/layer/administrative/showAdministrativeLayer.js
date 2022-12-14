import { batch } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import VectorImageLayer from 'ol/layer/VectorImage'
import { all, bbox as bboxStrategy } from 'ol/loadingstrategy'

import layer from '../../../shared_slices/Layer'
import { getAdministrativeAndRegulatoryLayersStyle } from '../../../../layers/styles/administrativeAndRegulatoryLayers.style'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../entities/map/constants'
import { getAdministrativeZoneFromAPI } from '../../../../api/geoserver'

const IRRETRIEVABLE_FEATURES_EVENT = 'IRRETRIEVABLE_FEATURES'

let currentNamespace = 'homepage'

const setIrretrievableFeaturesEvent = error => {
  return {
    type: IRRETRIEVABLE_FEATURES_EVENT,
    error: error
  }
}
/**
 *
 * @param {Object} nextVisibleLayer
 * @param {string} nextVisibleLayer.type
 * @param {string} nextVisibleLayer.zone
 * @returns
 */
const showAdministrativeLayer = nextVisibleLayer => dispatch => {
  currentNamespace = nextVisibleLayer.namespace
  const {
    addShowedLayer
  } = layer[currentNamespace].actions

  batch(() => {
    dispatch(addShowedLayer(nextVisibleLayer))
  })
}

export const getVectorOLLayer = (type, zone, isBackoffice) => {
  let name
  if (zone) {
    name = `${type}:${zone}`
  } else {
    name = type
  }
  const layer = new VectorImageLayer({
    source: getAdministrativeVectorSource(type, zone, isBackoffice),
    className: 'administrative',
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: feature => {
      return [getAdministrativeAndRegulatoryLayersStyle(type)(feature)]
    },
    declutter: true
  })
  layer.name = name

  return layer
}

const getAdministrativeVectorSource = (type, subZone, isBackoffice) => {
  if (subZone) {
    return showWholeVectorIfSubZone(type, subZone, isBackoffice)
  } else {
    return showBboxIfBigZone(type, subZone, isBackoffice)
  }
}

function showWholeVectorIfSubZone (type, subZone, isBackoffice) {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    strategy: all
  })

  getAdministrativeZoneFromAPI(type, null, subZone, isBackoffice).then(administrativeZoneFeature => {
    vectorSource.addFeatures(vectorSource.getFormat().readFeatures(administrativeZoneFeature))
  }).catch(e => {
    vectorSource.dispatchEvent(setIrretrievableFeaturesEvent(e))
  })

  vectorSource.once(IRRETRIEVABLE_FEATURES_EVENT, event => {
    console.warn(event.error)
  })

  return vectorSource
}

function showBboxIfBigZone (type, subZone, isBackoffice) {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    loader: extent => {
      getAdministrativeZoneFromAPI(type, extent, subZone, isBackoffice).then(administrativeZone => {
        vectorSource.clear(true)
        vectorSource.addFeatures(vectorSource.getFormat().readFeatures(administrativeZone))
      }).catch(e => {
        vectorSource.dispatchEvent(setIrretrievableFeaturesEvent(e))
        vectorSource.removeLoadedExtent(extent)
      })
    },
    strategy: bboxStrategy
  })

  vectorSource.once(IRRETRIEVABLE_FEATURES_EVENT, event => {
    console.warn(event.error)
  })

  return vectorSource
}

export default showAdministrativeLayer
