import { setPreviewFilteredVesselsMode } from '../../../../domain/shared_slices/Global'

import type { MainAppThunk } from '@store'

export const previewVessels = (): MainAppThunk => async dispatch => {
  dispatch(setPreviewFilteredVesselsMode(true))
}
