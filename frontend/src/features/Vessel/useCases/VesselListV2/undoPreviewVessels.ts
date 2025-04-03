import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'

import { setPreviewFilteredVesselsMode } from '../../../../domain/shared_slices/Global'

import type { MainAppThunk } from '@store'

export const undoPreviewVessels = (): MainAppThunk => async dispatch => {
  dispatch(setPreviewFilteredVesselsMode(false))

  dispatch(renderVesselFeatures())
}
