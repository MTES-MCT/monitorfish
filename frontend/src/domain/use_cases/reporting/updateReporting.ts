import { updateReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../entities/vessel/vessel'
import { removeError, setError } from '../../shared_slices/Global'
import { setCurrentAndArchivedReportingsOfSelectedVessel, updateCurrentReporting } from '../../shared_slices/Reporting'
import { addVesselReporting, removeVesselReporting } from '../../shared_slices/Vessel'
import { ReportingType } from '../../types/reporting'

import type { AppDispatch, AppGetState } from '../../../store'
import type { VesselIdentity } from '../../entities/vessel/types'
import type { InfractionSuspicionReporting, UpdateReporting } from '../../types/reporting'

export const updateReporting =
  (
    selectedVesselIdentity: VesselIdentity,
    id: number,
    nextReporting: UpdateReporting,
    previousReportingType: ReportingType
  ) =>
  async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
    const { currentAndArchivedReportingsOfSelectedVessel, vesselIdentity } = getState().reporting

    return updateReportingFromAPI(id, nextReporting)
      .then(updatedReporting => {
        if (nextReporting.reportingType === ReportingType.INFRACTION_SUSPICION) {
          dispatch(updateCurrentReporting(updatedReporting as InfractionSuspicionReporting))
        }

        if (previousReportingType !== nextReporting.reportingType) {
          const vesselId = Vessel.getVesselFeatureId(selectedVesselIdentity)

          dispatch(
            removeVesselReporting({
              reportingType: previousReportingType,
              vesselId
            })
          )
          dispatch(
            addVesselReporting({
              reportingType: nextReporting.reportingType,
              vesselId
            })
          )
        }

        // If the update is done from the Reporting tab of the vessel sidebar
        if (vesselIdentity && currentAndArchivedReportingsOfSelectedVessel?.current?.length) {
          const nextCurrentAndArchivedReporting = getUpdatedCurrentAndArchivedReportingOfSelectedVessel(
            currentAndArchivedReportingsOfSelectedVessel,
            updatedReporting
          )
          dispatch(
            setCurrentAndArchivedReportingsOfSelectedVessel({
              currentAndArchivedReportingsOfSelectedVessel: nextCurrentAndArchivedReporting,
              vesselIdentity: selectedVesselIdentity
            })
          )
        }

        dispatch(removeError())
      })
      .catch(error => {
        dispatch(setError(error))
      })
  }

function getUpdatedCurrentAndArchivedReportingOfSelectedVessel(
  currentAndArchivedReportingsOfSelectedVessel,
  updatedReporting
) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportingsOfSelectedVessel }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current
    .filter(reporting => reporting.id !== updatedReporting.id)
    .concat(updatedReporting)

  return nextCurrentAndArchivedReporting
}
