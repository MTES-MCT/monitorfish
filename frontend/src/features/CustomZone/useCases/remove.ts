import { MonitorFishMap } from '@features/Map/Map.types'
import { logSoftError } from '@mtes-mct/monitor-ui'

import { customZoneActions } from '../slice'
import { getLayer } from '../utils/getLayer'

import type { MainAppThunk } from '../../../store'

/**
 * Remove a Custom Zone layer
 */
export const remove =
  (uuid: string): MainAppThunk =>
  dispatch => {
    const layer = getLayer(MonitorFishMap.MonitorFishLayer.CUSTOM)
    if (!layer) {
      logSoftError({
        isSideWindowError: false,
        message: 'Layer `CUSTOM` not found in `monitorfishMap` map object.'
      })

      return
    }

    const features =
      layer
        .getSource()
        ?.getFeatures()
        .filter(feature => feature.get('uuid') === uuid) ?? []
    features.forEach(feature => layer.getSource()?.removeFeature(feature))

    dispatch(customZoneActions.remove(uuid))
  }
