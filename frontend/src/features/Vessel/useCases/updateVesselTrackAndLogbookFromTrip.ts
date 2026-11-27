import { NavigateTo } from '@features/Logbook/constants'
import { displayLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/displayLogbookMessageOverlays'
import { getVesselLogbook } from '@features/Logbook/useCases/getVesselLogbook'
import { selectIsPositionReplayActive } from '@features/PositionReplay/selectors'
import { getTrackRequestFromDates, getTrackRequestFromTrackDepth } from '@features/Vessel/types/vesselTrackDepth'
import { updateSelectedVesselTrack } from '@features/Vessel/useCases/updateSelectedVesselTrack'
import { customDayjs } from '@mtes-mct/monitor-ui'

import type { Logbook } from '@features/Logbook/Logbook.types'
import type { SelectableVesselTrackDepth } from '@features/Vessel/components/VesselSidebar/components/TrackRequest/types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

/**
 * Update from the trip navigation in the Logbook
 */
export const updateVesselTrackAndLogbookFromTrip =
  (
    vesselIdentity: Vessel.VesselIdentity | undefined,
    navigateTo: NavigateTo | undefined,
    isFromUserAction: boolean,
    nextTripNumber?: string
  ): MainAppThunk =>
  async (dispatch, getState) => {
    const {
      fishingActivities: { tripNumber: currentTripNumber },
      map: { defaultVesselTrackDepth }
    } = getState()

    const tripNumber = nextTripNumber ?? currentTripNumber ?? undefined
    const voyage = await dispatch(getVesselLogbook(vesselIdentity, navigateTo, isFromUserAction, tripNumber))
    if (!voyage || !vesselIdentity) {
      return
    }

    if (isFromUserAction) {
      // While replaying positions, a default track depth would end now
      const isTrackOfTripDates = !voyage.isLastVoyage || selectIsPositionReplayActive(getState())

      await dispatch(displayVesselTrack(voyage, vesselIdentity, defaultVesselTrackDepth, isTrackOfTripDates))
    }

    await dispatch(displayLogbookMessageOverlays())
  }

function displayVesselTrack(
  voyage: Logbook.VesselVoyage,
  vesselIdentity: Vessel.VesselIdentity,
  defaultVesselTrackDepth: SelectableVesselTrackDepth,
  isTrackOfTripDates: boolean
) {
  return async dispatch => {
    if (!voyage.startDate && !voyage.endDate) {
      return
    }

    const { afterDateTime, beforeDateTime } = getDateRangeMinusFourHoursPlusOneHour(voyage.startDate, voyage.endDate)
    const trackRequest = isTrackOfTripDates
      ? getTrackRequestFromDates(afterDateTime, beforeDateTime)
      : getTrackRequestFromTrackDepth(defaultVesselTrackDepth)

    await dispatch(updateSelectedVesselTrack(vesselIdentity, trackRequest))
  }
}

function getDateRangeMinusFourHoursPlusOneHour(afterDateTime, beforeDateTime) {
  const nextAfterDateTime = customDayjs(afterDateTime).subtract(4, 'hours')
  const nextBeforeDateTime = customDayjs(beforeDateTime).add(1, 'hour')

  return {
    afterDateTime: nextAfterDateTime.toDate(),
    beforeDateTime: nextBeforeDateTime.toDate()
  }
}
