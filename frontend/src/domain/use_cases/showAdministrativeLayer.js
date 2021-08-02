import VectorLayer from 'ol/layer/Vector'
import layer from '../reducers/Layer'
import { getVectorLayerStyle } from '../../layers/styles/vectorLayers.style'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../entities/map'
import { all, bbox as bboxStrategy } from 'ol/loadingstrategy'
import { getAdministrativeZoneFromAPI } from '../../api/fetch'
import { batch } from 'react-redux'

const IRRETRIEVABLE_FEATURES_EVENT = 'IRRETRIEVABLE_FEATURES'

let currentNamespace = 'homepage'

const setIrretrievableFeaturesEvent = error => {
  return {
    type: IRRETRIEVABLE_FEATURES_EVENT,
    error: error
  }
}

const showAdministrativeLayer = layerToShow => dispatch => {
  currentNamespace = layerToShow.namespace
  const {
    addLayer,
    addShowedLayer
  } = layer[currentNamespace].actions

  batch(() => {
    dispatch(addLayer(getVectorLayer(layerToShow.type, layerToShow.zone)))
    dispatch(addShowedLayer(layerToShow))
  })
}

const getVectorLayer = (type, zone) => {
  let className
  if (zone) {
    className = `${type}:${zone}`
  } else {
    className = type
  }

  return new VectorLayer({
    source: getAdministrativeVectorSource(type, zone),
    renderMode: 'image',
    className: className,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: feature => {
      return [getVectorLayerStyle(type)(feature)]
    },
    declutter: true
  })
}

const getAdministrativeVectorSource = (type, subZone) => {
  if (subZone) {
    return showWholeVectorIfSubZone(type, subZone)
  } else {
    return showBboxIfBigZone(type, subZone)
  }
}

function showWholeVectorIfSubZone (type, subZone) {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    strategy: all
  })

  getAdministrativeZoneFromAPI(type, null, subZone).then(administrativeZoneFeature => {
    vectorSource.addFeatures(vectorSource.getFormat().readFeatures(administrativeZoneFeature))
  }).catch(e => {
    vectorSource.dispatchEvent(setIrretrievableFeaturesEvent(e))
  })

  vectorSource.once(IRRETRIEVABLE_FEATURES_EVENT, event => {
    console.warn(event.error)
  })

  return vectorSource
}

function showBboxIfBigZone (type, subZone) {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    loader: extent => {
      getAdministrativeZoneFromAPI(type, extent, subZone).then(administrativeZone => {
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
