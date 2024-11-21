import { layerActions } from '@features/BaseMap/slice'
import { backOfficeLayerActions } from '@features/BaseMap/slice.backoffice'

import type { BackofficeAppThunk, MainAppThunk } from '@store'
import type { ShowedLayer } from 'domain/entities/layers/types'

// TODO This `Partial<ShowedLayer>` is really vague and forces many type checks/assertions. It should be more specific.
export const showRegulatoryZone =
  (zoneToShow: Partial<ShowedLayer>): MainAppThunk =>
  dispatch => {
    if (!zoneToShow.zone) {
      console.error('No regulatory layer to show.')

      return
    }
    dispatch(layerActions.addShowedLayer(zoneToShow))
  }

// TODO This `Partial<ShowedLayer>` is really vague and forces many type checks/assertions. It should be more specific.
export const showBackofficeRegulatoryZone =
  (zoneToShow: Partial<ShowedLayer>): BackofficeAppThunk =>
  dispatch => {
    if (!zoneToShow.zone) {
      console.error('No regulatory layer to show.')

      return
    }
    dispatch(backOfficeLayerActions.addShowedLayer(zoneToShow))
  }
