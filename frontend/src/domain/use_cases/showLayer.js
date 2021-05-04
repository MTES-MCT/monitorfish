import Layers from '../entities/layers'
import VectorLayer from 'ol/layer/Vector'
import { addLayer, addShowedLayer, pushLayerAndArea, setLastShowedFeatures } from '../reducers/Layer'
import { getVectorLayerStyle } from '../../layers/styles/vectorLayerStyles'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../entities/map'
import { all, bbox as bboxStrategy } from 'ol/loadingstrategy'
import { getHash } from '../../utils'
import { getAdministrativeZoneFromAPI, getRegulatoryZoneFromAPI } from '../../api/fetch'
import { getArea, getCenter } from 'ol/extent'
import { animateToRegulatoryLayer } from '../reducers/Map'

const IRRETRIEVABLE_FEATURES_EVENT = 'IRRETRIEVABLE_FEATURES'

const setIrretrievableFeaturesEvent = error => {
  return {
    type: IRRETRIEVABLE_FEATURES_EVENT,
    error: error
  }
}

const showLayer = layerToShow => (dispatch, getState) => {
  if (layerToShow && layerToShow.type) {
    const getVectorLayerClosure = getVectorLayer(dispatch)

    switch (layerToShow.type) {
      case Layers.REGULATORY.code: {
        if (!layerToShow.zone) {
          console.error('No regulatory layer to show.')
          return
        }

        const hash = getHash(`${layerToShow.zone.layerName}:${layerToShow.zone.zone}`)
        const gearCategory = getGearCategory(layerToShow.zone.gears, getState().gear.gears)
        const vectorLayer = getVectorLayerClosure(Layers.REGULATORY.code, layerToShow.zone, hash, gearCategory)
        dispatch(addLayer(vectorLayer))
        break
      }
      default: dispatch(addLayer(getVectorLayerClosure(layerToShow.type, layerToShow.zone))); break
    }

    dispatch(addShowedLayer(layerToShow))
  }
}

const getVectorLayer = dispatch => (type, subZone, hash, gearCategory) => {
  let className
  if (type === Layers.REGULATORY.code) {
    className = `${Layers.REGULATORY.code}:${subZone.layerName}:${subZone.zone}`
  } else if (subZone) {
    className = `${type}:${subZone}`
  } else {
    className = type
  }

  return new VectorLayer({
    source: type === Layers.REGULATORY.code
      ? getRegulatoryVectorSource(dispatch)(type, subZone)
      : getAdministrativeVectorSource()(type, subZone),
    renderMode: 'image',
    className: className,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: feature => {
      return [getVectorLayerStyle(type)(feature, hash, gearCategory)]
    },
    declutter: true
  })
}

const getRegulatoryVectorSource = dispatch => (type, regulatoryZoneProperties) => {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    loader: extent => {
      getRegulatoryZoneFromAPI(type, regulatoryZoneProperties).then(regulatoryZone => {
        vectorSource.addFeatures(vectorSource.getFormat().readFeatures(regulatoryZone))
        dispatch(setLastShowedFeatures(vectorSource.getFeatures()))
        dispatch(pushLayerAndArea({
          name: `${type}:${regulatoryZoneProperties.layerName}:${regulatoryZoneProperties.zone}`,
          area: getArea(vectorSource.getExtent())
        }))
        const center = getCenter(vectorSource.getExtent())
        if (center && center.length && !Number.isNaN(center[0]) && !Number.isNaN(center[1])) {
          dispatch(animateToRegulatoryLayer({
            name: `${type}:${regulatoryZoneProperties.layerName}:${regulatoryZoneProperties.zone}`,
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

const getAdministrativeVectorSource = () => (type, subZone) => {
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
    console.error(event.error)
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
    console.error(event.error)
  })

  return vectorSource
}

function removeMiscellaneousGears (layerGearsArray) {
  return layerGearsArray
    .filter(gearCode => gearCode !== 'MIS')
    .map(gearCode => gearCode)
}

function removeVariousLonglineGears (layerGearsArray) {
  return layerGearsArray
    .filter(gearCode => gearCode !== 'LL')
    .map(gearCode => gearCode)
}

export function getGearCategory (layerGears, gears) {
  let gear = null
  if (layerGears) {
    let layerGearsArray = layerGears.replace(/ /g, '').split(',')
    if (layerGearsArray.length > 1) {
      layerGearsArray = removeMiscellaneousGears(layerGearsArray)
    }
    if (layerGearsArray.length > 1) {
      layerGearsArray = removeVariousLonglineGears(layerGearsArray)
    }

    gear = gears
      .find(gear => {
        return layerGearsArray
          .some(gearCode => {
            return gearCode === gear.code
          })
      })
  }
  return gear ? gear.category : null
}

export default showLayer
