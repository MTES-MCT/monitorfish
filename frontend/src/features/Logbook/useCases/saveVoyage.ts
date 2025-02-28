import { logbookActions } from '@features/Logbook/slice'

import type { Logbook } from '@features/Logbook/Logbook.types'

export function saveVoyage(voyageWithVesselIdentity: Logbook.VesselVoyage, areFishingActivitiesShowedOnMap: boolean) {
  return async dispatch => {
    dispatch(
      voyageWithVesselIdentity.isLastVoyage
        ? logbookActions.setLastVoyage(voyageWithVesselIdentity)
        : logbookActions.setVoyage(voyageWithVesselIdentity)
    )

    dispatch(areFishingActivitiesShowedOnMap ? logbookActions.showAllOnMap() : logbookActions.hideAllOnMap())
  }
}
