import { priorNotificationActions } from '../slice'

import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

export const openPriorNotificationReportingList =
  (vesselIdentityWithVesselLength: Vessel.VesselIdentity): MainAppThunk<Promise<void>> =>
  async dispatch => {
    dispatch(priorNotificationActions.closeReportingList())
    dispatch(priorNotificationActions.setOpenedReportingListVesselIdentity(vesselIdentityWithVesselLength))
  }
