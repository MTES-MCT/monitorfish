import { batch } from 'react-redux'
import { resetSelectedVessel, closeVesselSidebar } from '../../shared_slices/Vessel'
import { hideFishingActivitiesOnMap } from '../../shared_slices/FishingActivities'
import { resetVesselBeaconMalfunctionsResumeAndHistory } from '../../shared_slices/BeaconMalfunction'
import { resetCurrentAndArchivedReportings } from '../../shared_slices/Reporting'

const unselectVessel = () => dispatch => {
  batch(() => {
    dispatch(resetSelectedVessel())
    dispatch(hideFishingActivitiesOnMap())
    dispatch(closeVesselSidebar())
    dispatch(resetCurrentAndArchivedReportings())
    dispatch(resetVesselBeaconMalfunctionsResumeAndHistory())
  })
}

export default unselectVessel
