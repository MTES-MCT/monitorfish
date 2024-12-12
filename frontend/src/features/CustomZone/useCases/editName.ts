import { MonitorFishMap } from '@features/Map/Map.types'
import { logSoftError } from '@mtes-mct/monitor-ui'

import { customZoneActions } from '../slice'
import { getLayer } from '../utils/getLayer'

import type { MainAppThunk } from '../../../store'

/**
 * Edit a Custom Zone name
 */
export const editName =
  (uuid: string, nextName: string | undefined): MainAppThunk =>
  dispatch => {
    if (!nextName) {
      return
    }

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
    features.forEach(feature => feature.set('name', nextName))

    dispatch(
      customZoneActions.editName({
        name: nextName,
        uuid
      })
    )
  }
