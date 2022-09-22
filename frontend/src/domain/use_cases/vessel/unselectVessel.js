import { batch } from 'react-redux'
import { resetSelectedVessel, closeVesselSidebar } from '../../shared_slices/Vessel'
import { hideFishingActivitiesOnMap } from '../../shared_slices/FishingActivities'
import { resetVesselBeaconMalfunctionsResumeAndHistory } from '../../shared_slices/BeaconMalfunction'
import { resetCurrentAndArchivedReportingsOfSelectedVessel } from '../../shared_slices/Reporting'
import { expandRightMenu } from '../../shared_slices/Global'

const unselectVessel = () => dispatch => {
  batch(() => {
    dispatch(resetSelectedVessel())
    dispatch(hideFishingActivitiesOnMap())
    dispatch(closeVesselSidebar())
    dispatch(resetCurrentAndArchivedReportingsOfSelectedVessel())
    dispatch(resetVesselBeaconMalfunctionsResumeAndHistory())
    dispatch(expandRightMenu())
  })
}

export default unselectVessel
