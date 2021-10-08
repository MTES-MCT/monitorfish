import { updateOrCreateRegulation } from '../../api/fetch'
import { setRegulationSaved } from '../../features/backoffice/Regulation.slice'
import { setError } from '../../domain/shared_slices/Global'

const createOrUpdateRegulationInGeoserver = (feature, type) => (dispatch) => {
  return updateOrCreateRegulation(feature, type)
    .then(_ => dispatch(setRegulationSaved(true)))
    .catch(e => {
      console.error(e.error)
      dispatch(setError(e))
    })
}

export default createOrUpdateRegulationInGeoserver
