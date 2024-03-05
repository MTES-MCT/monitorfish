import { updateReportingFromAPI } from '@api/reporting'

import { Vessel } from '../../../domain/entities/vessel/vessel'
import { removeError, setError } from '../../../domain/shared_slices/Global'
import { addVesselReporting, removeVesselReporting } from '../../../domain/shared_slices/Vessel'
import { ReportingType } from '../../../domain/types/reporting'
import {
  removeCurrentReporting,
  setCurrentAndArchivedReportingsOfSelectedVessel,
  updateCurrentReporting
} from '../slice'

import type { VesselIdentity } from '../../../domain/entities/vessel/types'
import type { EditedReporting, InfractionSuspicionReporting } from '../../../domain/types/reporting'
import type { MainAppThunk } from '@store'

export const updateReporting =
  (
    selectedVesselIdentity: VesselIdentity,
    id: number,
    nextReporting: EditedReporting,
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
          dispatch(removeCurrentReporting(id))
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
