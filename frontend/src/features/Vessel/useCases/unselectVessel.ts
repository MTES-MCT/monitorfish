import { logbookActions } from '@features/Logbook/slice'
import { closeVesselSidebar, resetSelectedVessel } from '@features/Vessel/slice'

import { resetVesselBeaconMalfunctionsResumeAndHistory } from '../../../domain/shared_slices/BeaconMalfunction'
import { expandRightMenu } from '../../../domain/shared_slices/Global'

export const unselectVessel = () => dispatch => {
  dispatch(resetSelectedVessel())
  dispatch(logbookActions.reset())
  dispatch(closeVesselSidebar())
  dispatch(resetVesselBeaconMalfunctionsResumeAndHistory())
  dispatch(expandRightMenu())
}
