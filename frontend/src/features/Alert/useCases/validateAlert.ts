import { RtkCacheTagType } from '@api/constants'
import { alertApi } from '@features/Alert/apis'
import { setPendingAlerts } from '@features/Alert/components/SideWindowAlerts/slice'
import { removeVesselAlertAndUpdateReporting } from '@features/Vessel/slice'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'
import { vesselApi } from '@features/Vessel/vesselApi'
import { deleteListItems } from '@utils/deleteListItems'
import { updateListItemsProp } from '@utils/updateListItemsProp'

import { setError } from '../../../domain/shared_slices/Global'

import type { LEGACY_PendingAlert } from '@features/Alert/types'
import type { MainAppThunk } from '@store'

export const validateAlert =
  (id: number): MainAppThunk =>
  async (dispatch, getState) => {
    const previousAlerts = getState().alert.pendingAlerts
    const previousAlertsWithValidatedFlag = setAlertAsValidated(previousAlerts, id)
    dispatch(setPendingAlerts(previousAlertsWithValidatedFlag))

    const timeout = setTimeout(() => {
      const previousAlertsWithoutValidated = deleteListItems(getState().alert.pendingAlerts, 'id', id)
      dispatch(setPendingAlerts(previousAlertsWithoutValidated))
    }, 3200)

    try {
      await dispatch(alertApi.endpoints.validateAlert.initiate(id)).unwrap()

      // We dispatch this action to update the reporting list
      // since it depends on the alerts list that we just updated
      dispatch(vesselApi.util.invalidateTags([RtkCacheTagType.Reportings]))

      const validatedAlert = previousAlertsWithValidatedFlag.find(alert => alert.id === id)
      if (!validatedAlert) {
        return
      }

      dispatch(
        removeVesselAlertAndUpdateReporting({
          alertType: validatedAlert.value?.type,
          isValidated: true,
          vesselFeatureId: VesselFeature.getVesselFeatureId(validatedAlert)
        })
      )
      dispatch(renderVesselFeatures())
    } catch (error) {
      clearTimeout(timeout)
      dispatch(setPendingAlerts(previousAlerts))
      dispatch(setError(error))
    }
  }

function setAlertAsValidated(previousAlerts: LEGACY_PendingAlert[], id: number): LEGACY_PendingAlert[] {
  return updateListItemsProp(previousAlerts, 'id', id, {
    isValidated: true
  })
}
