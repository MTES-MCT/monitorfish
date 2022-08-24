import { getAllGeometryWithoutProperty } from '../../../../api/geoserver'
import { MonitorFishWorker } from '../../../../workers/MonitorFishWorker'
import { setError } from '../../../shared_slices/Global'

const getGeometryWithoutRegulationReference = () => async (dispatch, getState) => {
  const monitorFishWorker = await new MonitorFishWorker()

  return getAllGeometryWithoutProperty(getState().global.inBackofficeMode)
    .then(features => monitorFishWorker.getGeometryWithoutRegulationRef(features))
    .catch(error => {
      dispatch(setError(error))
    })
}

export default getGeometryWithoutRegulationReference
