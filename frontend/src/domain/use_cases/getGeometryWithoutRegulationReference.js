import { getAllGeometryWithoutProperty } from '../../api/fetch'
import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../../workers/MonitorFishWorker'
import { setError } from '../shared_slices/Global'

const worker = new Worker()
const MonitorFishWorker = Comlink.wrap(worker)

const getGeometryWithoutRegulationReference = () => async (dispatch, getState) => {
  const worker = await new MonitorFishWorker()

  return getAllGeometryWithoutProperty(getState().global.inBackofficeMode)
    .then(features => {
      return worker.getGeometryWithoutRegulationRef(features)
    }).catch(error => {
      dispatch(setError(error))
    })
}

export default getGeometryWithoutRegulationReference
