import { updateRegulation } from '../../api/fetch'
import { setRegulationSaved } from '../../features/backoffice/Regulation.slice'

const createOrUpdateRegulationInGeoserver = (feature, type) => (dispatch) => {
  if (type === 'update') {
    return updateRegulation(feature)
      .then(_ => dispatch(setRegulationSaved(true)))
      .catch(e => {
        console.warn(e.error)
      })
  }
}

export default createOrUpdateRegulationInGeoserver
