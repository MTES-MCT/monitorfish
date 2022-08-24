import { addReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../entities/vessel'
import { removeError, setError } from '../../shared_slices/Global'
import { setCurrentAndArchivedReportings } from '../../shared_slices/Reporting'
import { addVesselReporting } from '../../shared_slices/Vessel'

const addReporting = newReporting => (dispatch, getState) => {
  const { selectedVesselIdentity } = getState().vessel
  const { currentAndArchivedReportings } = getState().reporting

  return addReportingFromAPI(newReporting)
    .then(reporting => {
      const nextCurrentAndArchivedReporting = addReportingToCurrent(currentAndArchivedReportings, reporting)
      dispatch(
        setCurrentAndArchivedReportings({
          currentAndArchivedReportings: nextCurrentAndArchivedReporting,
          vesselIdentity: selectedVesselIdentity,
        }),
      )
      dispatch(
        addVesselReporting({
          reportingType: newReporting?.type,
          vesselId: Vessel.getVesselFeatureId(selectedVesselIdentity),
        }),
      )
      dispatch(removeError())

      return Promise.resolve()
    })
    .catch(error => {
      dispatch(setError(error))

      return Promise.reject(error)
    })
}

function addReportingToCurrent(currentAndArchivedReportings, newReporting) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportings }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.concat(newReporting)

  return nextCurrentAndArchivedReporting
}

export default addReporting
