import { setSelectedVesselCustomTrackRequest, showVesselSidebarTab } from '../../shared_slices/Vessel'
import { showVessel } from './showVessel'
import { getVesselVoyage } from './getVesselVoyage'
import { VesselSidebarTab } from '../../entities/vessel/vessel'
import { END_OF_MALFUNCTION_REASON_RECORD } from '../../entities/beaconMalfunction/constants'
import { VesselTrackDepth } from '../../entities/vesselTrackDepth'

/**
 * Show the selected vessel on map.
 * If the vessel has resumed positions transmission, the default track depth will be showed so the
 * last positions of the vessel are shown on map.
 * Else, date times around the malfunctionStartDateTime will be created.
 * @param {BeaconMalfunction} beaconMalfunction
 * @param {boolean} openVMRERSTab
 */
export const showVesselFromBeaconMalfunctionsKanban = (beaconMalfunction, openVMRERSTab) => async dispatch => {
  if (beaconMalfunction?.endOfBeaconMalfunctionReason !== END_OF_MALFUNCTION_REASON_RECORD.RESUMED_TRANSMISSION.value) {
    const { afterDateTime, beforeDateTime } = getDatesAroundMalfunctionDateTime(beaconMalfunction)

    const trackRequest = {
      afterDateTime,
      beforeDateTime,
      trackDepth: VesselTrackDepth.CUSTOM
    }
    await dispatch(setSelectedVesselCustomTrackRequest(trackRequest))
  }

  await dispatch(showVessel(beaconMalfunction, false, false))
  dispatch(getVesselVoyage(beaconMalfunction, null, false))

  if (openVMRERSTab) {
    dispatch(showVesselSidebarTab(VesselSidebarTab.ERSVMS))
  }
}

function getDatesAroundMalfunctionDateTime (beaconMalfunction) {
  const afterDateTime = new Date(beaconMalfunction.malfunctionStartDateTime)
  const twentyFiveHours = 25
  afterDateTime.setTime(afterDateTime.getTime() - (twentyFiveHours * 60 * 60 * 1000))
  afterDateTime.setMilliseconds(0)

  const beforeDateTime = new Date(beaconMalfunction.malfunctionStartDateTime)
  beforeDateTime.setMilliseconds(0)

  return { afterDateTime, beforeDateTime }
}
