import { getAllRegulatoryLayersFromAPI } from '../../api/fetch'
import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../../workers/MonitorFishWorker'
import { setError } from '../shared_slices/Global'

const worker = new Worker()
const MonitorFishWorker = Comlink.wrap(worker)

const getAllRegulatoryLayers = () => async (dispatch) => {
  const worker = await new MonitorFishWorker()

  worker.toString()
  return getAllRegulatoryLayersFromAPI()
    .then(features => {
      // return worker.convertGeoJSONFeaturesToStructuredRegulatoryObject(features)
    }).catch(error => {
      dispatch(setError(error))
    })
}

export default getAllRegulatoryLayers
