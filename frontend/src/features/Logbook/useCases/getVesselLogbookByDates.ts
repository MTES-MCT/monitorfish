import { resetDisplayedLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/resetDisplayedLogbookMessageOverlays'
import { saveVoyage } from '@features/Logbook/useCases/saveVoyage'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { vesselsAreEquals } from '@features/Vessel/types/vessel'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Level } from '@mtes-mct/monitor-ui'

import { displayedErrorActions } from '../../../domain/shared_slices/DisplayedError'
import { removeError } from '../../../domain/shared_slices/Global'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { logbookApi } from '../api'
import { logbookActions } from '../slice'

import type { TrackRequest } from '@features/Vessel/types/types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

/**
 * Get the vessel fishing voyage when navigating in the trips with the positions
 */
export const getVesselLogbookByDates =
  (vesselIdentity: Vessel.VesselIdentity | undefined, trackRequest: TrackRequest): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    if (!vesselIdentity) {
      return
    }

    const {
      vessel: { selectedVesselIdentity: currentSelectedVesselIdentity }
    } = getState()
    const isSameVesselAsCurrentlyShowed = vesselsAreEquals(vesselIdentity, currentSelectedVesselIdentity)

    dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))

    try {
      const voyage = await dispatch(
        logbookApi.endpoints.getVesselLogbookByDates.initiate({ trackRequest, vesselIdentity })
      ).unwrap()
      if (!!voyage?.totalTripsFoundForDates && voyage?.totalTripsFoundForDates > 1) {
        dispatch(
          addMainWindowBanner({
            children:
              `Nous avons trouvé ${voyage.totalTripsFoundForDates} marées pour ces dates, ` +
              "seulement la 1ère marée est affichée dans l'onglet JPE.",
            closingDelay: 5000,
            isClosable: true,
            isFixed: true,
            level: Level.WARNING,
            withAutomaticClosing: true
          })
        )
      }

      if (!voyage) {
        if (!isSameVesselAsCurrentlyShowed) {
          dispatch(resetDisplayedLogbookMessageOverlays())
        }

        dispatch(
          addMainWindowBanner({
            children: "Ce navire n'a pas envoyé de message JPE pendant cette période.",
            closingDelay: 5000,
            isClosable: true,
            isFixed: true,
            level: Level.WARNING,
            withAutomaticClosing: true
          })
        )

        return
      }

      dispatch(
        saveVoyage({
          ...voyage,
          vesselIdentity
        })
      )

      dispatch(removeError())
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => getVesselLogbookByDates(vesselIdentity, trackRequest),
          true,
          DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
        )
      )
      dispatch(logbookActions.resetIsLoading())
    }
  }
