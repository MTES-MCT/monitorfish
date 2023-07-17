import { resetVesselBeaconMalfunctionsResumeAndHistory } from '../../shared_slices/BeaconMalfunction'
import { closeFishingActivities } from '../../shared_slices/FishingActivities'
import { expandRightMenu } from '../../shared_slices/Global'
import { resetCurrentAndArchivedReportingsOfSelectedVessel } from '../../shared_slices/Reporting'
import { closeVesselSidebar, resetSelectedVessel } from '../../shared_slices/Vessel'

export const unselectVessel = () => dispatch => {
  dispatch(resetSelectedVessel())
  dispatch(closeFishingActivities())
  dispatch(closeVesselSidebar())
  dispatch(resetCurrentAndArchivedReportingsOfSelectedVessel())
  dispatch(resetVesselBeaconMalfunctionsResumeAndHistory())
  dispatch(expandRightMenu())
}
