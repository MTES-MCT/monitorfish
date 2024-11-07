import { priorNotificationActions } from '../slice'

import type { MainAppThunk } from '@store'
import type { VesselIdentity } from 'domain/entities/vessel/types'

export const openPriorNotificationReportingList =
  (vesselIdentity: VesselIdentity): MainAppThunk<Promise<void>> =>
  async dispatch => {
    dispatch(priorNotificationActions.closeReportingList())
    dispatch(priorNotificationActions.setOpenedReportingListVesselIdentity(vesselIdentity))
  }
