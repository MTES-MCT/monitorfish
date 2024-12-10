import { LayerProperties } from '@features/Map/constants'
import { getCenter } from 'ol/extent'

import { isNumeric } from '../../../utils/isNumeric'
import { mapActions } from '../../Map/slice'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type { HybridAppDispatch, HybridAppThunk } from '@store/types'
import type { Feature } from 'ol'
import type { Coordinate } from 'ol/coordinate'

type Params = {
  feature?: Feature | undefined
  topicAndZone?: MonitorFishMap.ShowedLayer
}

export const zoomInLayer =
  <T extends HybridAppDispatch>(layer: Params): HybridAppThunk<T> =>
  // @ts-ignore Required to avoid reducers typing conflicts. Not fancy but allows us to keep Thunk context type-checks.
  (dispatch, getState) => {
    if (layer.topicAndZone) {
      const name = `${LayerProperties.REGULATORY.code}:${layer.topicAndZone.topic}:${layer.topicAndZone.zone}`

      const layerToZoomIn = getState().layer.layersToFeatures.find(layerFeature => layerFeature.name === name)
      if (layerToZoomIn) {
        dispatch(animateToRegulatoryLayer(layerToZoomIn.center, name))
      }
    } else if (layer.feature) {
      const extent = layer.feature.getGeometry()?.getExtent()
      if (!extent) {
        return
      }

      const center = getCenter(extent)
      dispatch(animateToRegulatoryLayer(center, LayerProperties.REGULATORY_PREVIEW))
    }
  }

const animateToRegulatoryLayer =
  <T extends HybridAppDispatch>(center: Coordinate, name: string | MonitorFishMap.ShowableLayer): HybridAppThunk<T> =>
  // @ts-ignore Required to avoid reducers typing conflicts. Not fancy but allows us to keep Thunk context type-checks.
  dispatch => {
    if (center?.length && isNumeric(center[0]) && isNumeric(center[1])) {
      dispatch(
        mapActions.animateToRegulatoryLayer({
          center,
          name
        })
      )
    }
  }
