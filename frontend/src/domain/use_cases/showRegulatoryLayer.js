import Layers, { getGearCategory } from '../entities/layers'
import VectorLayer from 'ol/layer/Vector'
import layer from '../shared_slices/Layer'
import { getVectorLayerStyle } from '../../layers/styles/vectorLayer.style'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../entities/map'
import { all } from 'ol/loadingstrategy'
import { getHash } from '../../utils'
import { getRegulatoryZoneFromAPI } from '../../api/fetch'
import { getArea, getCenter } from 'ol/extent'
import { animateToRegulatoryLayer } from '../shared_slices/Map'
import { batch } from 'react-redux'

const IRRETRIEVABLE_FEATURES_EVENT = 'IRRETRIEVABLE_FEATURES'

let currentNamespace = 'homepage'

const setIrretrievableFeaturesEvent = error => {
  return {
    type: IRRETRIEVABLE_FEATURES_EVENT,
    error: error
  }
}

/**
 * Show a Regulatory or Administrative layer
 * @param layerToShow {AdministrativeOrRegulatoryLayer} - The layer to show
 */
const showRegulatoryLayer = layerToShow => (dispatch, getState) => {
  currentNamespace = layerToShow.namespace
  const {
    addLayer,
    addShowedLayer
  } = layer[currentNamespace].actions

  const getVectorLayerClosure = getVectorLayer(dispatch)

  if (!layerToShow.zone) {
    console.error('No regulatory layer to show.')
    return
  }

  const hash = getHash(`${layerToShow.topic}:${layerToShow.zone}`)
  const gearCategory = getGearCategory(layerToShow.gears, getState().gear.gears)
  const vectorLayer = getVectorLayerClosure(layerToShow, hash, gearCategory)
  batch(() => {
    dispatch(addLayer(vectorLayer))
    dispatch(addShowedLayer(layerToShow))
  })
}

const getVectorLayer = dispatch => (layerToShow, hash, gearCategory) => {
  const className = `${Layers.REGULATORY.code}:${layerToShow.topic}:${layerToShow.zone}`

  return new VectorLayer({
    source: getRegulatoryVectorSource(dispatch)(layerToShow),
    renderMode: 'image',
    className: className,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: feature => {
      return [getVectorLayerStyle(Layers.REGULATORY.code)(feature, hash, gearCategory)]
    },
    declutter: true
  })
}

const getRegulatoryVectorSource = dispatch => regulatoryZoneProperties => {
  const {
    pushLayerAndArea,
    setLastShowedFeatures
  } = layer[currentNamespace].actions
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    loader: extent => {
      getRegulatoryZoneFromAPI(Layers.REGULATORY.code, regulatoryZoneProperties).then(regulatoryZone => {
        vectorSource.addFeatures(vectorSource.getFormat().readFeatures(regulatoryZone))
        batch(() => {
          dispatch(setLastShowedFeatures(vectorSource.getFeatures()))
          dispatch(pushLayerAndArea({
            name: `${Layers.REGULATORY.code}:${regulatoryZoneProperties.topic}:${regulatoryZoneProperties.zone}`,
            area: getArea(vectorSource.getExtent())
          }))
        })
        const center = getCenter(vectorSource.getExtent())
        if (center && center.length && !Number.isNaN(center[0]) && !Number.isNaN(center[1])) {
          dispatch(animateToRegulatoryLayer({
            name: `${Layers.REGULATORY.code}:${regulatoryZoneProperties.topic}:${regulatoryZoneProperties.zone}`,
            center: center
          }))
        }
      }).catch(e => {
        vectorSource.dispatchEvent(setIrretrievableFeaturesEvent(e))
        vectorSource.removeLoadedExtent(extent)
      })
    },
    strategy: all
  })

  vectorSource.once(IRRETRIEVABLE_FEATURES_EVENT, event => {
    console.error(event.error)
  })

  return vectorSource
}

export default showRegulatoryLayer
