import { batch } from 'react-redux'

import { updateReportingFromAPI } from '../../../api/reporting'
import { removeError, setError } from '../../shared_slices/Global'
import { setCurrentAndArchivedReportingsOfSelectedVessel, updateCurrentReporting } from '../../shared_slices/Reporting'

import type { AppDispatch, AppGetState } from '../../../store'

export const updateReporting =
  (id, nextReporting) =>
  async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
    const { selectedVesselIdentity } = getState().vessel
    const { currentAndArchivedReportingsOfSelectedVessel, vesselIdentity } = getState().reporting

    updateReportingFromAPI(id, nextReporting)
      .then(updatedReporting => {
        dispatch(updateCurrentReporting(updatedReporting))
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
        throw Error('tet')
      })
      .catch(error => {
        console.error(error)
        batch(() => {
          dispatch(
            setCurrentAndArchivedReportingsOfSelectedVessel({
              currentAndArchivedReportingsOfSelectedVessel,
              vesselIdentity: selectedVesselIdentity
            })
          )
          dispatch(setError(error))
        })
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
