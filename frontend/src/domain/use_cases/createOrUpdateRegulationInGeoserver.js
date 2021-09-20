import { updateOrCreateRegulation } from '../../api/fetch'
import { setRegulationSaved } from '../../features/backoffice/Regulation.slice'

const createOrUpdateRegulationInGeoserver = (feature, type) => (dispatch) => {
  return updateOrCreateRegulation(feature, type)
    .then(_ => dispatch(setRegulationSaved(true)))
    .catch(e => {
      console.warn(e.error)
    })
}

export default createOrUpdateRegulationInGeoserver
