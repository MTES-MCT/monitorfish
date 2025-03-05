import { END_OF_MALFUNCTION_REASON_RECORD } from '@features/BeaconMalfunction/constants'
import { vesselActions } from '@features/Vessel/slice'
import { VesselSidebarTab } from '@features/Vessel/types/vessel'
import { extractVesselIdentityProps } from '@features/Vessel/utils'

import { showVessel } from './showVessel'
import { VesselTrackDepth } from '../types/vesselTrackDepth'

import type { TrackRequest } from '@features/Vessel/types/types'

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
    } satisfies TrackRequest
    await dispatch(vesselActions.setSelectedVesselCustomTrackRequest(trackRequest))
  }

  const identity = extractVesselIdentityProps(beaconMalfunction)
  await dispatch(showVessel(identity, false))

  if (openVMRERSTab) {
    dispatch(vesselActions.setSelectedVesselSidebarTab(VesselSidebarTab.ERSVMS))
  }
}

function getDatesAroundMalfunctionDateTime(beaconMalfunction) {
  const afterDateTime = new Date(beaconMalfunction.malfunctionStartDateTime)
  const twentyFiveHours = 25
  afterDateTime.setTime(afterDateTime.getTime() - twentyFiveHours * 60 * 60 * 1000)
  afterDateTime.setMilliseconds(0)

  const beforeDateTime = new Date(beaconMalfunction.malfunctionStartDateTime)
  beforeDateTime.setMilliseconds(0)

  return { afterDateTime, beforeDateTime }
}
