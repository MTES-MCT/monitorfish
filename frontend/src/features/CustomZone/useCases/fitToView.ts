import { logSoftError } from '@mtes-mct/monitor-ui'

import { MonitorFishLayer } from '../../../domain/entities/layers/types'
import { fitViewToFeatures } from '../utils/fitViewToFeatures'
import { getLayer } from '../utils/getLayer'

/**
 * Fit Custom Zone to view
 */
export const fitToView = (uuid: string) => {
  const layer = getLayer(MonitorFishLayer.CUSTOM)
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
      .filter(feature => feature.get('uuid') === uuid) || []

  fitViewToFeatures(features)
}
