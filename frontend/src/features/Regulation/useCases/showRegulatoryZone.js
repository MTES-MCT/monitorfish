import { getArea, getCenter } from 'ol/extent'
import GeoJSON from 'ol/format/GeoJSON'
import VectorImageLayer from 'ol/layer/VectorImage'
import { all } from 'ol/loadingstrategy'
import VectorSource from 'ol/source/Vector'
import { batch } from 'react-redux'
import simplify from 'simplify-geojson'

import { getRegulatoryZoneFromAPI } from '../../../api/geoserver'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../domain/entities/map/constants'
import layer from '../../../domain/shared_slices/Layer'
import { animateToRegulatoryLayer } from '../../../domain/shared_slices/Map'
import { isNumeric } from '../../../utils/isNumeric'
import { getRegulatoryLayerStyle } from '../layers/styles/regulatoryLayer.style'

const IRRETRIEVABLE_FEATURES_EVENT = 'IRRETRIEVABLE_FEATURES'

let currentNamespace = 'homepage'

const setIrretrievableFeaturesEvent = error => ({
  error,
  type: IRRETRIEVABLE_FEATURES_EVENT
})

/**
 * Show a Regulatory zone
 * @param zoneToShow {import('../../../domain/types/layer').AdministrativeOrRegulatoryLayerIdentity} - The zone to show
 */
const showRegulatoryZone = zoneToShow => dispatch => {
  currentNamespace = zoneToShow.namespace
  const { addShowedLayer } = layer[currentNamespace].actions

  if (!zoneToShow.zone) {
    console.error('No regulatory layer to show.')

    return
  }
  dispatch(addShowedLayer(zoneToShow))
}

export const getVectorOLLayer = (dispatch, getState) => nextVisibleLayer => {
  const name = `${LayerProperties.REGULATORY.code}:${nextVisibleLayer.topic}:${nextVisibleLayer.zone}`
  const source = getRegulatoryVectorSource(dispatch, getState)(nextVisibleLayer)

  const _layer = new VectorImageLayer({
    className: 'regulatory',
    source,
    style: feature => [getRegulatoryLayerStyle(feature, nextVisibleLayer)]
  })
  _layer.name = name

  return _layer
}

const getRegulatoryVectorSource = (dispatch, getState) => regulatoryZoneProperties => {
  const zoneName = `${LayerProperties.REGULATORY.code}:${regulatoryZoneProperties.topic}:${regulatoryZoneProperties.zone}`

  const { pushLayerToFeatures, setLastShowedFeatures } = layer[currentNamespace].actions

  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    loader: extent => {
      getRegulatoryZoneFromAPI(
        LayerProperties.REGULATORY.code,
        regulatoryZoneProperties,
        getState().mainWindow.isBackoffice
      )
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

          const feature = getState().regulatory.simplifiedGeometries
            ? simplifiedRegulatoryZone || regulatoryZone
            : regulatoryZone
          vectorSource.addFeatures(vectorSource.getFormat().readFeatures(feature))
          const center = getCenter(vectorSource.getExtent())
          const centerHasValidCoordinates = center?.length && isNumeric(center[0]) && isNumeric(center[1])

          batch(() => {
            dispatch(
              pushLayerToFeatures({
                area: getArea(vectorSource.getExtent()),
                center,
                features: regulatoryZone,
                name: zoneName,
                simplifiedFeatures: simplifiedRegulatoryZone
              })
            )
            dispatch(setLastShowedFeatures(vectorSource.getFeatures()))

            if (centerHasValidCoordinates) {
              dispatch(
                animateToRegulatoryLayer({
                  center,
                  name: zoneName
                })
              )
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
