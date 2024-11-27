import { mainMapActions } from '@features/MainMap/slice'
import { backOfficeMainMapActions } from '@features/MainMap/slice.backoffice'

import type { MainMap } from '@features/MainMap/MainMap.types'
import type { BackofficeAppThunk, MainAppThunk } from '@store'

// TODO This `Partial<MainMap.ShowedLayer>` is really vague and forces many type checks/assertions. It should be more specific.
export const showRegulatoryZone =
  (zoneToShow: Partial<MainMap.ShowedLayer>): MainAppThunk =>
  dispatch => {
    if (!zoneToShow.zone) {
      console.error('No regulatory layer to show.')

      return
    }
    dispatch(mainMapActions.addShowedLayer(zoneToShow))
  }

// TODO This `Partial<MainMap.ShowedLayer>` is really vague and forces many type checks/assertions. It should be more specific.
export const showBackofficeRegulatoryZone =
  (zoneToShow: Partial<MainMap.ShowedLayer>): BackofficeAppThunk =>
  dispatch => {
    if (!zoneToShow.zone) {
      console.error('No regulatory layer to show.')

      return
    }
    dispatch(backOfficeMainMapActions.addShowedLayer(zoneToShow))
  }
