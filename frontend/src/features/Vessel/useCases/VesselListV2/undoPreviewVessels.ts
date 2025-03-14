import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'

import { setDisplayedComponents } from '../../../../domain/shared_slices/DisplayedComponent'
import { setPreviewFilteredVesselsMode } from '../../../../domain/shared_slices/Global'

import type { MainAppThunk } from '@store'

export const undoPreviewVessels = (): MainAppThunk => async dispatch => {
  dispatch(setPreviewFilteredVesselsMode(false))

  // TODO Delete the code after this comment when deprecated VesselList is deleted
  // And VesselListV2 is used
  dispatch(
    setDisplayedComponents({
      isVesselListModalDisplayed: true
    })
  )

  dispatch(renderVesselFeatures())
}
