import { mainMapActions } from '@features/MainMap/slice'
import { backOfficeMainMapActions } from '@features/MainMap/slice.backoffice'

import type { MainMap } from '@features/MainMap/MainMap.types'
import type { HybridAppDispatch, HybridAppThunk } from '@store/types'

// TODO This `Partial<MainMap.ShowedLayer>` is really vague and forces many type checks/assertions. It should be more specific.

export const showRegulatoryZone =
  <T extends HybridAppDispatch>(zoneToShow: Partial<MainMap.ShowedLayer>): HybridAppThunk<T> =>
  // @ts-ignore Required to avoid reducers typing conflicts. Not fancy but allows us to keep Thunk context type-checks.
  (dispatch, getState) => {
    if (!zoneToShow.zone) {
      console.error('No regulatory layer to show.')

      return
    }

    const actions = getState().global.isBackoffice ? backOfficeMainMapActions : mainMapActions

    dispatch(actions.addShowedLayer(zoneToShow))
  }
