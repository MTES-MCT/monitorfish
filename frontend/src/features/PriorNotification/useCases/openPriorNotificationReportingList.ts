import { priorNotificationActions } from '../slice'

import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

export const openPriorNotificationReportingList =
  (vesselIdentity: Vessel.VesselIdentity): MainAppThunk<Promise<void>> =>
  async dispatch => {
    dispatch(priorNotificationActions.closeReportingList())
    dispatch(priorNotificationActions.setOpenedReportingListVesselIdentity(vesselIdentity))
  }
