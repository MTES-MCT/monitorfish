import { animateToVesselCoordinates } from '@features/Map/useCases/animateMap'
import { unselectVessel } from '@features/Vessel/useCases/unselectVessel'

import type { AISVessel } from '@features/Vessel/AISVessel.types'
import type { MainAppThunk } from '@store'

export const showAISVessel =
  (aisVessel: AISVessel.AISVessel): MainAppThunk =>
  (dispatch, getState) => {
    animateToVesselCoordinates(aisVessel.coordinates as [number, number], false)

    if (getState().vessel.vesselSidebarIsOpen) {
      dispatch(unselectVessel())
    }
  }
