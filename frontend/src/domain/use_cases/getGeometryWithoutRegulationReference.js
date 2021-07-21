import { getAllGeometryWithoutProperty } from '../../api/fetch'
import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../../workers/MapperWorker'
import { setError } from '../reducers/Global'

const worker = new Worker()
const MapperWorker = Comlink.wrap(worker)

const getGeometryWithoutRegulationReference = dispatch => async () => {
  const worker = await new MapperWorker()

  return getAllGeometryWithoutProperty()
    .then(features => {
      const obj = worker.getGeometryWithoutRegulationRef(features)
      console.log(obj)
      return obj
    }).catch(error => {
      dispatch(setError(error))
    })
}

export default getGeometryWithoutRegulationReference
