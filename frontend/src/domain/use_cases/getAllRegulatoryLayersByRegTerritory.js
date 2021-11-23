import { getAllRegulatoryLayersFromAPI } from '../../api/fetch'
import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../../workers/MonitorFishWorker'
import { setError } from '../shared_slices/Global'
import {
  setRegulatoryTopics,
  setLayersTopicsByRegTerritory
} from '../shared_slices/Regulatory'
import { batch } from 'react-redux'

const worker = new Worker()
const MonitorFishWorker = Comlink.wrap(worker)

const getAllRegulatoryLayersByRegTerritory = () => async (dispatch, getState) => {
  const worker = await new MonitorFishWorker()

  return getAllRegulatoryLayersFromAPI(getState().global.inBackofficeMode)
    .then(features => {
      return worker.convertGeoJSONFeaturesToStructuredRegulatoryObject(features)
    })
    .then(response => {
      const {
        layersTopicsByRegulatoryTerritory,
        regulatoryTopics
      } = response

      batch(() => {
        dispatch(setRegulatoryTopics(regulatoryTopics))
        dispatch(setLayersTopicsByRegTerritory(layersTopicsByRegulatoryTerritory))
      })
    })
    .catch(error => {
      dispatch(setError(error))
    })
}

export default getAllRegulatoryLayersByRegTerritory
