import { logSoftError } from '@mtes-mct/monitor-ui'

import { addReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../../domain/entities/vessel/vessel'
import { addVesselReporting } from '../../../domain/shared_slices/Vessel'
import { removeError, setError } from '../../MainWindow/slice'
import { addReportingToCurrentReportings, setCurrentAndArchivedReportingsOfSelectedVessel } from '../slice'

import type { ReportingCreation } from '../../../domain/types/reporting'
import type { MainAppThunk } from '../../../store'

export const addReporting =
  (newReporting: ReportingCreation): MainAppThunk<Promise<void>> =>
  (dispatch, getState) => {
    const { selectedVesselIdentity } = getState().vessel
    // TODO Can this case happen? Is it the right way to handle it?
    if (!selectedVesselIdentity) {
      logSoftError({
        message: '`selectedVesselIdentity` is null.',
        userMessage: 'Aucun navire sélectionné pour ajouter un signalement.'
      })

      return Promise.resolve()
    }
    const { currentAndArchivedReportingsOfSelectedVessel } = getState().reporting

    return addReportingFromAPI(newReporting)
      .then(reporting => {
        dispatch(addReportingToCurrentReportings(reporting))
        const nextCurrentAndArchivedReporting = addReportingToCurrent(
          currentAndArchivedReportingsOfSelectedVessel,
          reporting
        )
        dispatch(
          setCurrentAndArchivedReportingsOfSelectedVessel({
            currentAndArchivedReportingsOfSelectedVessel: nextCurrentAndArchivedReporting,
            vesselIdentity: selectedVesselIdentity
          })
        )
        dispatch(
          addVesselReporting({
            reportingType: newReporting?.type,
            vesselFeatureId: Vessel.getVesselFeatureId(selectedVesselIdentity)
          })
        )
        dispatch(removeError())

        return Promise.resolve()
      })
      .catch(error => {
        dispatch(setError(error))

        return Promise.reject(error)
      })
  }

function addReportingToCurrent(currentAndArchivedReportingsOfSelectedVessel, newReporting) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportingsOfSelectedVessel }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.concat(newReporting)

  return nextCurrentAndArchivedReporting
}
