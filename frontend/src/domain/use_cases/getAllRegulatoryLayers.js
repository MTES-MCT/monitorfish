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

const worker = new Worker()
const MonitorFishWorker = Comlink.wrap(worker)

const getAllRegulatoryLayers = () => async (dispatch, getState) => {
  const worker = await new MonitorFishWorker()

  return getAllRegulatoryLayersFromAPI(getState().global.inBackofficeMode)
    .then(features => {
      return worker.convertGeoJSONFeaturesToStructuredRegulatoryObject(features)
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
      })
    })
    .catch(error => {
      console.error(error)
      dispatch(setError(error))
    })
}

export default getAllRegulatoryLayers
