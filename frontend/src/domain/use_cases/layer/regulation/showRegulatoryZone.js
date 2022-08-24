import { getArea, getCenter } from 'ol/extent'
import GeoJSON from 'ol/format/GeoJSON'
import VectorImageLayer from 'ol/layer/VectorImage'
import { all } from 'ol/loadingstrategy'
import VectorSource from 'ol/source/Vector'
import { batch } from 'react-redux'
import simplify from 'simplify-geojson'

import { getRegulatoryZoneFromAPI } from '../../../../api/geoserver'
import { getAdministrativeAndRegulatoryLayersStyle } from '../../../../layers/styles/administrativeAndRegulatoryLayers.style'
import { getHash } from '../../../../utils'
import Layers, { getGearCategory } from '../../../entities/layers'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../entities/map'
import layer from '../../../shared_slices/Layer'
import { animateToRegulatoryLayer } from '../../../shared_slices/Map'

const IRRETRIEVABLE_FEATURES_EVENT = 'IRRETRIEVABLE_FEATURES'

let currentNamespace = 'homepage'

const setIrretrievableFeaturesEvent = error => ({
  error,
  type: IRRETRIEVABLE_FEATURES_EVENT,
})

/**
 * Show a Regulatory zone
 * @param zoneToShow {AdministrativeOrRegulatoryLayer} - The zone to show
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

export const getVectorOLLayer = (dispatch, getState) => layerToShow => {
  const { gears } = getState().gear
  const hash = getHash(`${layerToShow.topic}:${layerToShow.zone}`)
  const name = `${Layers.REGULATORY.code}:${layerToShow.topic}:${layerToShow.zone}`

  const source = getRegulatoryVectorSource(dispatch, getState)(layerToShow)

  const gearCategory = getGearCategory(layerToShow.gears, gears)

  const _layer = new VectorImageLayer({
    className: 'regulatory',
    source,
    style: feature => [getAdministrativeAndRegulatoryLayersStyle(Layers.REGULATORY.code)(feature, hash, gearCategory)],
  })
  _layer.name = name

  return _layer
}

const getRegulatoryVectorSource = (dispatch, getState) => regulatoryZoneProperties => {
  const zoneName = `${Layers.REGULATORY.code}:${regulatoryZoneProperties.topic}:${regulatoryZoneProperties.zone}`

  const { pushLayerToFeatures, setLastShowedFeatures } = layer[currentNamespace].actions

  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION,
    }),
    loader: extent => {
      getRegulatoryZoneFromAPI(Layers.REGULATORY.code, regulatoryZoneProperties, getState().global.inBackofficeMode)
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
          const centerHasValidCoordinates = center?.length && !Number.isNaN(center[0]) && !Number.isNaN(center[1])

          batch(() => {
            dispatch(
              pushLayerToFeatures({
                area: getArea(vectorSource.getExtent()),
                center,
                features: regulatoryZone,
                name: zoneName,
                simplifiedFeatures: simplifiedRegulatoryZone,
              }),
            )
            dispatch(setLastShowedFeatures(vectorSource.getFeatures()))

            if (centerHasValidCoordinates) {
              dispatch(
                animateToRegulatoryLayer({
                  center,
                  name: zoneName,
                }),
              )
            }
          })
        })
        .catch(e => {
          vectorSource.dispatchEvent(setIrretrievableFeaturesEvent(e))
          vectorSource.removeLoadedExtent(extent)
        })
    },
    strategy: all,
  })

  vectorSource.once(IRRETRIEVABLE_FEATURES_EVENT, event => {
    console.error(event.error)
  })

  return vectorSource
}

export default showRegulatoryZone
