import { updateReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../entities/vessel/vessel'
import { removeError, setError } from '../../shared_slices/Global'
import {
  removeCurrentReporting,
  setCurrentAndArchivedReportingsOfSelectedVessel,
  updateCurrentReporting
} from '../../shared_slices/Reporting'
import { addVesselReporting, removeVesselReporting } from '../../shared_slices/Vessel'
import { ReportingType } from '../../types/reporting'

import type { MainAppThunk } from '../../../store'
import type { VesselIdentity } from '../../entities/vessel/types'
import type { InfractionSuspicionReporting, ReportingUpdate } from '../../types/reporting'

export const updateReporting =
  (
    selectedVesselIdentity: VesselIdentity,
    id: number,
    nextReporting: ReportingUpdate,
    previousReportingType: ReportingType
  ): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { currentAndArchivedReportingsOfSelectedVessel, vesselIdentity } = getState().reporting

    return updateReportingFromAPI(id, nextReporting)
      .then(updatedReporting => {
        if (nextReporting.type === ReportingType.INFRACTION_SUSPICION) {
          dispatch(updateCurrentReporting(updatedReporting as InfractionSuspicionReporting))
        }

        if (
          nextReporting.type === ReportingType.OBSERVATION &&
          previousReportingType === ReportingType.INFRACTION_SUSPICION
        ) {
          dispatch(removeCurrentReporting(updatedReporting.id))
        }

        // We update the reportings of the last positions vessels state
        if (previousReportingType !== nextReporting.type) {
          const vesselFeatureId = Vessel.getVesselFeatureId(selectedVesselIdentity)

          dispatch(
            removeVesselReporting({
              reportingType: previousReportingType,
              vesselFeatureId
            })
          )
          dispatch(
            addVesselReporting({
              reportingType: nextReporting.type,
              vesselFeatureId
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
