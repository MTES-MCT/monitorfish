import { batch } from 'react-redux'
import { getArea, getCenter } from 'ol/extent'
import GeoJSON from 'ol/format/GeoJSON'
import VectorImageLayer from 'ol/layer/VectorImage'
import { all } from 'ol/loadingstrategy'
import VectorSource from 'ol/source/Vector'
import simplify from 'simplify-geojson'

import { Layer } from '../../../entities/layers/constants'
import { animateToRegulatoryLayer } from '../../../shared_slices/Map'
import layer from '../../../shared_slices/Layer'
import { getAdministrativeAndRegulatoryLayersStyle } from '../../../../features/map/layers/styles/administrativeAndRegulatoryLayers.style'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../entities/map/constants'
import { getRegulatoryZoneFromAPI } from '../../../../api/geoserver'
import { isNumeric } from '../../../../utils/isNumeric'

const IRRETRIEVABLE_FEATURES_EVENT = 'IRRETRIEVABLE_FEATURES'

let currentNamespace = 'homepage'

const setIrretrievableFeaturesEvent = error => {
  return {
    type: IRRETRIEVABLE_FEATURES_EVENT,
    error: error
  }
}

/**
 * Show a Regulatory zone
 * @param zoneToShow {import('../../../types/layer').AdministrativeOrRegulatoryLayerIdentity} - The zone to show
 */
const showRegulatoryZone = zoneToShow => dispatch => {
  currentNamespace = zoneToShow.namespace
  const {
    addShowedLayer
  } = layer[currentNamespace].actions

  if (!zoneToShow.zone) {
    console.error('No regulatory layer to show.')
    return
  }
  dispatch(addShowedLayer(zoneToShow))
}

export const getVectorOLLayer = (dispatch, getState) => nextVisibleLayer => {
  const name = `${Layer.REGULATORY.code}:${nextVisibleLayer.topic}:${nextVisibleLayer.zone}`
  const source = getRegulatoryVectorSource(dispatch, getState)(nextVisibleLayer)

  const _layer = new VectorImageLayer({
    source,
    className: 'regulatory',
    style: feature => [getAdministrativeAndRegulatoryLayersStyle(Layer.REGULATORY.code)(feature, nextVisibleLayer)]
  })
  _layer.name = name

  return _layer
}

const getRegulatoryVectorSource = (dispatch, getState) => regulatoryZoneProperties => {
  const zoneName = `${Layer.REGULATORY.code}:${regulatoryZoneProperties.topic}:${regulatoryZoneProperties.zone}`

  const {
    setLastShowedFeatures,
    pushLayerToFeatures
  } = layer[currentNamespace].actions

  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    loader: extent => {
      getRegulatoryZoneFromAPI(Layer.REGULATORY.code, regulatoryZoneProperties, getState().global.isBackoffice)
        .then(regulatoryZone => {
          if (!regulatoryZone.geometry) {
            vectorSource.dispatchEvent(setIrretrievableFeaturesEvent(new Error('Aucune géometrie dans la zone')))
            vectorSource.removeLoadedExtent(extent)
            return
          }

          let simplifiedRegulatoryZone = null
          try {
            simplifiedRegulatoryZone = simplify(regulatoryZone, 0.01)
          } catch (e) {
            console.error(e)
          }

          const feature = getState().regulatory.simplifiedGeometries ? simplifiedRegulatoryZone || regulatoryZone : regulatoryZone
          vectorSource.addFeatures(vectorSource.getFormat().readFeatures(feature))
          const center = getCenter(vectorSource.getExtent())
          const centerHasValidCoordinates = center?.length && isNumeric(center[0]) && isNumeric(center[1])

          batch(() => {
            dispatch(pushLayerToFeatures({
              name: zoneName,
              area: getArea(vectorSource.getExtent()),
              simplifiedFeatures: simplifiedRegulatoryZone,
              features: regulatoryZone,
              center: center
            }))
            dispatch(setLastShowedFeatures(vectorSource.getFeatures()))

            if (centerHasValidCoordinates) {
              dispatch(animateToRegulatoryLayer({
                name: zoneName,
                center: center
              }))
            }
          })
        })
        .catch(e => {
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

export default showRegulatoryZone
