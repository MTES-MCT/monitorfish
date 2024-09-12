import { logbookActions } from '@features/Logbook/slice'
import { resetSelectedVesselReportings } from '@features/Reporting/slice'

import { resetVesselBeaconMalfunctionsResumeAndHistory } from '../../shared_slices/BeaconMalfunction'
import { expandRightMenu } from '../../shared_slices/Global'
import { closeVesselSidebar, resetSelectedVessel } from '../../shared_slices/Vessel'

export const unselectVessel = () => dispatch => {
  dispatch(resetSelectedVessel())
  dispatch(logbookActions.reset())
  dispatch(closeVesselSidebar())
  dispatch(resetSelectedVesselReportings())
  dispatch(resetVesselBeaconMalfunctionsResumeAndHistory())
  dispatch(expandRightMenu())
}
