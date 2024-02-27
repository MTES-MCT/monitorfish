import { logSoftError, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import GeoJSON from 'ol/format/GeoJSON'

import { MonitorFishLayer } from '../../../domain/entities/layers/types'
import { customZoneActions } from '../slice'
import { fitViewToFeatures } from '../utils/fitViewToFeatures'
import { getLayer } from '../utils/getLayer'

import type { MainAppThunk } from '@store'

/**
 * Show or hide a Custom Zone layer
 */
export const showOrHide =
  (uuid: string): MainAppThunk =>
  (dispatch, getState) => {
    const { zones } = getState().customZone
    const zone = zones[uuid]
    if (!zone) {
      return
    }

    const layer = getLayer(MonitorFishLayer.CUSTOM)
    if (!layer) {
      logSoftError({
        isSideWindowError: false,
        message: 'Layer `CUSTOM` not found in `monitorfishMap` map object.'
      })

      return
    }

    if (zone.isShown) {
      const features =
        layer
          .getSource()
          ?.getFeatures()
          .filter(feature => feature.get('uuid') === uuid) || []

      features.forEach(feature => layer.getSource()?.removeFeature(feature))
      dispatch(customZoneActions.hide(uuid))
    } else {
      const features = new GeoJSON({
        dataProjection: WSG84_PROJECTION,
        featureProjection: OPENLAYERS_PROJECTION
      }).readFeatures(zone.feature)

      layer.getSource()?.addFeatures(features)
      dispatch(customZoneActions.show(uuid))

      fitViewToFeatures(features)
    }
  }
