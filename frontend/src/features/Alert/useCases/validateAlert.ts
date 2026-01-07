import { RtkCacheTagType } from '@api/constants'
import { alertApi } from '@features/Alert/apis'
import { setPendingAlerts } from '@features/Alert/components/SideWindowAlerts/slice'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { removeVesselAlertAndUpdateReporting } from '@features/Vessel/slice'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'
import { vesselApi } from '@features/Vessel/vesselApi'
import { Level } from '@mtes-mct/monitor-ui'
import { deleteListItems } from '@utils/deleteListItems'

import type { MainAppThunk } from '@store'

export const validateAlert =
  (id: number): MainAppThunk =>
  async (dispatch, getState) => {
    const previousAlerts = getState().alert.pendingAlerts

    try {
      await dispatch(alertApi.endpoints.validateAlert.initiate(id)).unwrap()

      const previousAlertsWithoutValidated = deleteListItems(getState().alert.pendingAlerts, 'id', id)
      dispatch(setPendingAlerts(previousAlertsWithoutValidated))

      // We dispatch this action to update the reporting list
      // since it depends on the alerts list that we just updated
      dispatch(vesselApi.util.invalidateTags([RtkCacheTagType.Reportings]))

      const validatedAlert = previousAlerts.find(alert => alert.id === id)
      if (!validatedAlert) {
        return
      }

      dispatch(
        removeVesselAlertAndUpdateReporting({
          alertName: validatedAlert.value.name,
          isValidated: true,
          vesselFeatureId: VesselFeature.getVesselFeatureId(validatedAlert)
        })
      )
      dispatch(renderVesselFeatures())
      dispatch(
        addSideWindowBanner({
          children: 'Alerte validée et ajoutée à la fiche du navire',
          closingDelay: 4000,
          isClosable: true,
          level: Level.SUCCESS,
          withAutomaticClosing: true
        })
      )
    } catch (error) {
      dispatch(setPendingAlerts(previousAlerts))
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
