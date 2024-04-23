import { logbookActions } from '../../../features/Logbook/slice'
import { expandRightMenu } from '../../../features/MainWindow/slice'
import { resetCurrentAndArchivedReportingsOfSelectedVessel } from '../../../features/Reporting/slice'
import { resetVesselBeaconMalfunctionsResumeAndHistory } from '../../shared_slices/BeaconMalfunction'
import { closeVesselSidebar, resetSelectedVessel } from '../../shared_slices/Vessel'

export const unselectVessel = () => dispatch => {
  dispatch(resetSelectedVessel())
  dispatch(logbookActions.reset())
  dispatch(closeVesselSidebar())
  dispatch(resetCurrentAndArchivedReportingsOfSelectedVessel())
  dispatch(resetVesselBeaconMalfunctionsResumeAndHistory())
  dispatch(expandRightMenu())
}
