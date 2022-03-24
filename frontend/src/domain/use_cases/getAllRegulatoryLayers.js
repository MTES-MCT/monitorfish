import { batch } from 'react-redux'
import { getAllRegulatoryLayersFromAPI } from '../../api/fetch'
import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../../workers/MonitorFishWorker'
import { setError } from '../shared_slices/Global'
import {
  setSelectedRegulatoryZone,
  setLayersTopicsByRegTerritory,
  setRegulatoryLayerLawTypes
} from '../shared_slices/Regulatory'
import layer from '../shared_slices/Layer'

const worker = new Worker()
const MonitorFishWorker = Comlink.wrap(worker)

const getAllRegulatoryLayers = () => async (dispatch, getState) => {
  const monitorFishWorker = await new MonitorFishWorker()
  const { setShowedLayersWithLocalStorageValues } = layer.homepage.actions
  const { speciesByCode } = getState().species

  return getAllRegulatoryLayersFromAPI(getState().global.inBackofficeMode)
    .then(features => {
      return monitorFishWorker.convertGeoJSONFeaturesToStructuredRegulatoryObject(features, speciesByCode)
    })
    .then(response => {
      const {
        layersWithoutGeometry,
        layersTopicsByRegulatoryTerritory
      } = response
      batch(() => {
        dispatch(setLayersTopicsByRegTerritory(layersTopicsByRegulatoryTerritory))
        dispatch(setRegulatoryLayerLawTypes(layersTopicsByRegulatoryTerritory))
        dispatch(setSelectedRegulatoryZone(layersWithoutGeometry))
        dispatch(setShowedLayersWithLocalStorageValues({ regulatoryZones: layersWithoutGeometry, namespace: 'homepage' }))
      })
    })
    .catch(error => {
      console.error(error)
      dispatch(setError(error))
    })
}

export default getAllRegulatoryLayers
