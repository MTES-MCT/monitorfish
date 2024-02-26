import { getAllGeometryWithoutProperty } from '../../../api/geoserver'
import { setError } from '../../../domain/shared_slices/Global'
import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'

const getGeometryWithoutRegulationReference = () => async (dispatch, getState) => {
  const monitorFishWorker = await MonitorFishWorker()

  return getAllGeometryWithoutProperty(getState().global.isBackoffice)
    .then(features => monitorFishWorker.getIdToGeometryObject(features))
    .catch(error => {
      dispatch(setError(error))
    })
}

export default getGeometryWithoutRegulationReference
