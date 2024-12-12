import { vesselActions } from '@features/Vessel/slice'
import { END_OF_MALFUNCTION_REASON_RECORD } from 'domain/entities/beaconMalfunction/constants'
import { VesselSidebarTab } from 'domain/entities/vessel/vessel'
import { VesselTrackDepth } from 'domain/entities/vesselTrackDepth'

import { showVessel } from './showVessel'

import type { TrackRequest } from 'domain/entities/vessel/types'

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

  await dispatch(showVessel(beaconMalfunction, false, true))

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
