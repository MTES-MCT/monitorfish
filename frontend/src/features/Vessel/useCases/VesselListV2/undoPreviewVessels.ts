import { setPreviewFilteredVesselsMode } from '../../../../domain/shared_slices/Global'

import type { MainAppThunk } from '@store'

export const undoPreviewVessels = (): MainAppThunk => async dispatch => {
  dispatch(setPreviewFilteredVesselsMode(false))
}
