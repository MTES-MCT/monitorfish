import { batch } from 'react-redux'
import { getAllRegulatoryLayersFromAPI } from '../../api/fetch'
import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../../workers/MonitorFishWorker'
import { setError } from '../shared_slices/Global'
import {
  setLayersTopicsByRegTerritory,
  setRegulatoryLayerLawTypes
} from '../shared_slices/Regulatory'

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
        layersWithoutGeometry,
        layersTopicsByRegTerritory
      } = response
      batch(() => {
        dispatch(setLayersTopicsByRegTerritory(layersWithoutGeometry))
        dispatch(setRegulatoryLayerLawTypes(layersTopicsByRegTerritory))
      })
    })
    .catch(error => {
      console.error(error)
      dispatch(setError(error))
    })
}

export default getAllRegulatoryLayersByRegTerritory
