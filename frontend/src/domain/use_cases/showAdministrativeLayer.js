import layer from '../shared_slices/Layer'
import { getAdministrativeAndRegulatoryLayersStyle } from '../../layers/styles/administrativeAndRegulatoryLayers.style'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../entities/map'
import { all, bbox as bboxStrategy } from 'ol/loadingstrategy'
import { getAdministrativeZoneFromAPI } from '../../api/fetch'
import { batch } from 'react-redux'
import VectorImageLayer from 'ol/layer/VectorImage'

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
 * @param {Object} layerToShow
 * @param {string} layerToShow.type
 * @param {string} layerToShow.zone
 * @returns
 */
const showAdministrativeLayer = layerToShow => (dispatch, getState) => {
  currentNamespace = layerToShow.namespace
  const {
    addShowedLayer
  } = layer[currentNamespace].actions

  batch(() => {
    dispatch(addShowedLayer(layerToShow))
  })
}

export const getVectorLayer = (type, zone, inBackofficeMode) => {
  let name
  if (zone) {
    name = `${type}:${zone}`
  } else {
    name = type
  }
  const layer = new VectorImageLayer({
    source: getAdministrativeVectorSource(type, zone, inBackofficeMode),
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

const getAdministrativeVectorSource = (type, subZone, inBackofficeMode) => {
  if (subZone) {
    return showWholeVectorIfSubZone(type, subZone, inBackofficeMode)
  } else {
    return showBboxIfBigZone(type, subZone, inBackofficeMode)
  }
}

function showWholeVectorIfSubZone (type, subZone, inBackofficeMode) {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    strategy: all
  })

  getAdministrativeZoneFromAPI(type, null, subZone, inBackofficeMode).then(administrativeZoneFeature => {
    vectorSource.addFeatures(vectorSource.getFormat().readFeatures(administrativeZoneFeature))
  }).catch(e => {
    vectorSource.dispatchEvent(setIrretrievableFeaturesEvent(e))
  })

  vectorSource.once(IRRETRIEVABLE_FEATURES_EVENT, event => {
    console.warn(event.error)
  })

  return vectorSource
}

function showBboxIfBigZone (type, subZone, inBackofficeMode) {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    loader: extent => {
      getAdministrativeZoneFromAPI(type, extent, subZone, inBackofficeMode).then(administrativeZone => {
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
