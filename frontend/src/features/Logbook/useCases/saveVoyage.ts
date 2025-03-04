import { logbookActions } from '@features/Logbook/slice'

import type { Logbook } from '@features/Logbook/Logbook.types'

export function saveVoyage(voyageWithVesselIdentity: Logbook.VesselVoyage) {
  return async dispatch => {
    await dispatch(
      voyageWithVesselIdentity.isLastVoyage
        ? logbookActions.setLastVoyage(voyageWithVesselIdentity)
        : logbookActions.setVoyage(voyageWithVesselIdentity)
    )
  }
}
