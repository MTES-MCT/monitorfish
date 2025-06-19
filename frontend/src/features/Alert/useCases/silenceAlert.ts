import { alertApi } from '@features/Alert/apis'
import {
  addToPendingAlertsBeingSilenced,
  removeFromSilencedAlertsQueue,
  setPendingAlerts,
  setSilencedAlerts
} from '@features/Alert/components/SideWindowAlerts/slice'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { removeVesselAlertAndUpdateReporting } from '@features/Vessel/slice'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'
import { Level } from '@mtes-mct/monitor-ui'
import { deleteListItems } from '@utils/deleteListItems'

import { setError } from '../../../domain/shared_slices/Global'

import type { PendingAlert, SilencedAlertPeriodRequest } from '@features/Alert/types'
import type { MainAppThunk } from '@store'

/**
 * Silence an alert
 */
export const silenceAlert =
  (silencedAlertPeriodRequest: SilencedAlertPeriodRequest, pendingAlert: PendingAlert): MainAppThunk =>
  async (dispatch, getState) => {
    const previousPendingAlerts = getState().alert.pendingAlerts
    const previousSilencedAlerts = getState().alert.silencedAlerts

    dispatch(
      addToPendingAlertsBeingSilenced({
        pendingAlertId: pendingAlert.id,
        silencedAlertPeriodRequest
      })
    )
    const timeout = setTimeout(() => {
      const nextPendingAlerts = deleteListItems(getState().alert.pendingAlerts, 'id', pendingAlert.id)
      dispatch(setPendingAlerts(nextPendingAlerts))

      dispatch(removeFromSilencedAlertsQueue(pendingAlert.id))
    }, 3200)

    try {
      const silencedAlert = await dispatch(
        alertApi.endpoints.silenceAlert.initiate({ id: pendingAlert.id, silencedAlertPeriodRequest })
      ).unwrap()

      dispatch(
        removeVesselAlertAndUpdateReporting({
          alertType: pendingAlert.value.type,
          isValidated: false,
          vesselFeatureId: VesselFeature.getVesselFeatureId(pendingAlert)
        })
      )

      if (!silencedAlert) {
        dispatch(
          addSideWindowBanner({
            children: `L'alerte n'est plus active.`,
            closingDelay: 3000,
            isClosable: true,
            isFixed: true,
            level: Level.WARNING,
            withAutomaticClosing: true
          })
        )

        return
      }

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
