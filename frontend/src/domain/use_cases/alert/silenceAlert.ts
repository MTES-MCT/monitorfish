import {
  addToPendingAlertsBeingSilenced,
  removeFromSilencedAlertsQueue,
  setPendingAlerts,
  setSilencedAlerts
} from '@features/Alert/components/SideWindowAlerts/slice'
import { removeVesselAlertAndUpdateReporting } from '@features/Vessel/slice'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'

import { silenceAlertFromAPI } from '../../../api/alert'
import { deleteListItems } from '../../../utils/deleteListItems'
import { Vessel } from '../../entities/vessel/vessel'
import { setError } from '../../shared_slices/Global'

import type { MainAppThunk } from '../../../store'
import type { SilencedAlertPeriodRequest } from '@features/Alert/types'

/**
 * Silence an alert
 */
export const silenceAlert =
  (silencedAlertPeriodRequest: SilencedAlertPeriodRequest, pendingAlertId: string): MainAppThunk =>
  async (dispatch, getState) => {
    const previousPendingAlerts = getState().alert.pendingAlerts
    const previousSilencedAlerts = getState().alert.silencedAlerts

    dispatch(
      addToPendingAlertsBeingSilenced({
        pendingAlertId,
        silencedAlertPeriodRequest
      })
    )
    const timeout = setTimeout(() => {
      const nextPendingAlerts = deleteListItems(getState().alert.pendingAlerts, 'id', pendingAlertId)
      dispatch(setPendingAlerts(nextPendingAlerts))

      dispatch(removeFromSilencedAlertsQueue(pendingAlertId))
    }, 3200)

    try {
      const silencedAlert = await silenceAlertFromAPI(pendingAlertId, silencedAlertPeriodRequest)
      dispatch(
        removeVesselAlertAndUpdateReporting({
          alertType: silencedAlert.value.type,
          isValidated: false,
          vesselFeatureId: Vessel.getVesselFeatureId(silencedAlert)
        })
      )

      const nextSilencedAlerts = [silencedAlert, ...previousSilencedAlerts]
      dispatch(setSilencedAlerts(nextSilencedAlerts))
      dispatch(renderVesselFeatures())
    } catch (error) {
      clearTimeout(timeout)

      dispatch(setPendingAlerts(previousPendingAlerts))
      dispatch(setSilencedAlerts(previousSilencedAlerts))
      dispatch(setError(error))
    }
  }
