import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { resetDisplayedLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/resetDisplayedLogbookMessageOverlays'
import { selectPositionsDateTime } from '@features/PositionReplay/selectors'
import { vesselsAreEquals } from '@features/Vessel/types/vessel'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { displayedErrorActions } from '../../../domain/shared_slices/DisplayedError'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { logbookApi } from '../api'
import { NavigateTo } from '../constants'
import { logbookActions } from '../slice'

import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

/**
 * Without a trip at the replayed date, no trip is displayed:
 * the current one would be read as the one of the replayed date.
 */
export const getVesselLogbookAtDateTime =
  (vesselIdentity: Vessel.VesselIdentity, dateTime: string): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    dispatch(logbookActions.setIsLoading())
    dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))

    try {
      const voyage = await dispatch(
        logbookApi.endpoints.getVesselLogbook.initiate(
          { dateTime, tripNumber: undefined, vesselIdentity, voyageRequest: NavigateTo.AT_DATE_TIME },
          RTK_FORCE_REFETCH_QUERY_OPTIONS
        )
      ).unwrap()

      // The date or the vessel changed while fetching: a newer request displays its own trip
      const state = getState()
      if (
        selectPositionsDateTime(state) !== dateTime ||
        !vesselsAreEquals(vesselIdentity, state.vessel.selectedVesselIdentity)
      ) {
        return
      }

      if (!voyage) {
        dispatch(resetDisplayedLogbookMessageOverlays())
        dispatch(logbookActions.setNoVoyage(vesselIdentity))

        return
      }

      dispatch(logbookActions.setVoyage({ ...voyage, vesselIdentity }))
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => getVesselLogbookAtDateTime(vesselIdentity, dateTime),
          true,
          DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
        )
      )
      dispatch(logbookActions.resetIsLoading())
    }
  }
