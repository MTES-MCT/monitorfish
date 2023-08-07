import { setError } from '../../../shared_slices/Global'
import { getAllGeometryWithoutProperty } from '../../../../api/geoserver'
import { MonitorFishWorker } from '../../../../workers/MonitorFishWorker'

const getGeometryWithoutRegulationReference = () => async (dispatch, getState) => {
  const monitorFishWorker = await new MonitorFishWorker()

  return getAllGeometryWithoutProperty(getState().global.isBackoffice)
    .then(features => {
      return monitorFishWorker.getIdToGeometryObject(features)
    }).catch(error => {
      dispatch(setError(error))
    })
}

export default getGeometryWithoutRegulationReference
