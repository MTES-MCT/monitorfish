import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import type { Vessel } from '@features/Vessel/Vessel.types'

export function displayBannerWarningFromAPIFeedback(
  positions: Vessel.VesselPosition[],
  isTrackDepthModified: boolean,
  isFromUserAction: boolean
) {
  return dispatch => {
    const baseWarningObject = {
      closingDelay: 5000,
      isClosable: true,
      isFixed: true,
      level: Level.WARNING,
      withAutomaticClosing: true
    }

    if (trackDepthHasBeenModifiedFromAPI(positions, isTrackDepthModified, isFromUserAction)) {
      dispatch(
        addMainWindowBanner({
          ...baseWarningObject,
          children:
            "Nous n'avons pas trouvé de dernier DEP pour ce navire, nous affichons " +
            'les positions des dernières 24 heures.'
        })
      )
    }

    if (noPositionsFoundForVessel(positions, isFromUserAction)) {
      dispatch(
        addMainWindowBanner({
          ...baseWarningObject,
          children: "Nous n'avons trouvé aucune position."
        })
      )
    }

    if (noPositionsFoundForEnteredDateTime(positions)) {
      dispatch(
        addMainWindowBanner({
          ...baseWarningObject,
          children: "Nous n'avons trouvé aucune position pour ces dates."
        })
      )
    }
  }
}

function noPositionsFoundForVessel(positions, isFromUserAction) {
  return !positions?.length && isFromUserAction
}

function noPositionsFoundForEnteredDateTime(positions) {
  return !positions?.length
}

function trackDepthHasBeenModifiedFromAPI(positions, isTrackDepthModified, isFromUserAction) {
  return positions?.length && isTrackDepthModified && isFromUserAction
}
