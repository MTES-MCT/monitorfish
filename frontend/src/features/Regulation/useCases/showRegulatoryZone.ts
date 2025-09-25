import { layerActions } from '@features/Map/layer.slice'
import { backOfficeLayerActions } from '@features/Map/layer.slice.backoffice'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type { HybridAppThunk } from '@store/types'

// TODO This `Partial<Map.ShowedLayer>` is really vague and forces many type checks/assertions. It should be more specific.
export const showRegulatoryZone =
  (zoneToShow: Partial<MonitorFishMap.ShowedLayer>): HybridAppThunk =>
  (dispatch, getState) => {
    if (!zoneToShow.zone) {
      console.error('No regulatory layer to show.')

      return
    }

    const actions = getState().global.isBackoffice ? backOfficeLayerActions : layerActions

    dispatch(actions.addShowedLayer(zoneToShow))
  }
