import { logbookActions } from '@features/Logbook/slice'
import { mainWindowReportingActions } from '@features/Reporting/mainWindowReporting.slice'
import { closeVesselSidebar, resetSelectedVessel } from '@features/Vessel/slice'

import { resetVesselBeaconMalfunctionsResumeAndHistory } from '../../shared_slices/BeaconMalfunction'
import { expandRightMenu } from '../../shared_slices/Global'

export const unselectVessel = () => dispatch => {
  dispatch(resetSelectedVessel())
  dispatch(logbookActions.reset())
  dispatch(closeVesselSidebar())
  dispatch(mainWindowReportingActions.resetSelectedVesselReportings())
  dispatch(resetVesselBeaconMalfunctionsResumeAndHistory())
  dispatch(expandRightMenu())
}
