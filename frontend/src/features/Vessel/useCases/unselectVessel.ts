import { logbookActions } from '@features/Logbook/slice'
import { resetDisplayedLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/resetDisplayedLogbookMessageOverlays'
import { unsetControlSummary } from '@features/Vessel/components/VesselSidebar/control.slice'
import { closeVesselSidebar, resetSelectedVessel } from '@features/Vessel/slice'

import { resetVesselBeaconMalfunctionsResumeAndHistory } from '../../../domain/shared_slices/BeaconMalfunction'
import { expandRightMenu } from '../../../domain/shared_slices/Global'

export const unselectVessel = () => dispatch => {
  dispatch(resetSelectedVessel())
  dispatch(logbookActions.reset())
  dispatch(closeVesselSidebar())
  dispatch(resetVesselBeaconMalfunctionsResumeAndHistory())
  dispatch(expandRightMenu())
  dispatch(resetDisplayedLogbookMessageOverlays())
  dispatch(unsetControlSummary())
}
