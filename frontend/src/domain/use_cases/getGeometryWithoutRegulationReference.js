import { getAllGeometryWithoutProperty } from '../../api/fetch'
import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../../workers/MapperWorker'
import { setError } from '../reducers/Global'

const worker = new Worker()
const MapperWorker = Comlink.wrap(worker)

const getGeometryWithoutRegulationReference = () => async (dispatch) => {
  const worker = await new MapperWorker()

  return getAllGeometryWithoutProperty()
    .then(features => {
      return worker.getGeometryWithoutRegulationRef(features)
    }).catch(error => {
      dispatch(setError(error))
    })
}

export default getGeometryWithoutRegulationReference
