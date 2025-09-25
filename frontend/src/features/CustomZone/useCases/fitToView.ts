import { MonitorFishMap } from '@features/Map/Map.types'
import { logSoftError } from '@utils/logSoftError'

import { fitViewToFeatures } from '../utils/fitViewToFeatures'
import { getLayer } from '../utils/getLayer'

/**
 * Fit Custom Zone to view
 */
export const fitToView = (uuid: string) => {
  const layer = getLayer(MonitorFishMap.MonitorFishLayer.CUSTOM)
  if (!layer) {
    logSoftError({
      message: 'Layer `CUSTOM` not found in `monitorfishMap` map object.'
    })

    return
  }

  const features =
    layer
      .getSource()
      ?.getFeatures()
      .filter(feature => feature.get('uuid') === uuid) ?? []

  fitViewToFeatures(features)
}
