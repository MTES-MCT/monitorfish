import { alertApi } from '@features/Alert/apis'
import { setPendingAlerts, setSilencedAlerts } from '@features/Alert/components/SideWindowAlerts/slice'
import { getSilencedAlertPeriodText } from '@features/Alert/utils'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { removeVesselAlertAndUpdateReporting } from '@features/Vessel/slice'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'
import { Level } from '@mtes-mct/monitor-ui'
import { deleteListItems } from '@utils/deleteListItems'

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

    try {
      const silencedAlert = await dispatch(
        alertApi.endpoints.silenceAlert.initiate({ id: pendingAlert.id, silencedAlertPeriodRequest })
      ).unwrap()

      const nextPendingAlerts = deleteListItems(getState().alert.pendingAlerts, 'id', pendingAlert.id)
      dispatch(setPendingAlerts(nextPendingAlerts))

      dispatch(
        removeVesselAlertAndUpdateReporting({
          alertName: pendingAlert.value.name,
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

      dispatch(
        addSideWindowBanner({
          children: `L'alerte sera suspendue ${getSilencedAlertPeriodText(silencedAlertPeriodRequest)}`,
          closingDelay: 4000,
          isClosable: true,
          level: Level.SUCCESS,
          withAutomaticClosing: true
        })
      )
    } catch (error) {
      dispatch(setPendingAlerts(previousPendingAlerts))
      dispatch(setSilencedAlerts(previousSilencedAlerts))
      dispatch(
        addSideWindowBanner({
          children: (error as Error).message,
          closingDelay: 6000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }
