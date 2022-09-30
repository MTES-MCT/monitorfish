import { batch } from 'react-redux'

import { resetVesselBeaconMalfunctionsResumeAndHistory } from '../../shared_slices/BeaconMalfunction'
import { hideFishingActivitiesOnMap } from '../../shared_slices/FishingActivities'
import { expandRightMenu } from '../../shared_slices/Global'
import { resetCurrentAndArchivedReportingsOfSelectedVessel } from '../../shared_slices/Reporting'
import { resetSelectedVessel, closeVesselSidebar } from '../../shared_slices/Vessel'

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
