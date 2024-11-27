import { getCenter } from 'ol/extent'

import { mapActions } from '../../../domain/shared_slices/Map'
import { isNumeric } from '../../../utils/isNumeric'
import { LayerProperties } from '../../MainMap/constants'

import type { MainMap } from '@features/MainMap/MainMap.types'
import type { HybridAppDispatch, HybridAppThunk } from '@store/types'
import type { Feature } from 'ol'
import type { Coordinate } from 'ol/coordinate'

type Params = {
  feature?: Feature | undefined
  topicAndZone?: MainMap.ShowedLayer
}

export const zoomInLayer =
  <T extends HybridAppDispatch>(layer: Params): HybridAppThunk<T> =>
  // @ts-ignore Required to avoid reducers typing conflicts. Not fancy but allows us to keep Thunk context type-checks.
  (dispatch, getState) => {
    if (layer.topicAndZone) {
      const name = `${LayerProperties.REGULATORY.code}:${layer.topicAndZone.topic}:${layer.topicAndZone.zone}`

      const layerToZoomIn = getState().mainMap.layersToFeatures.find(layerFeature => layerFeature.name === name)
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
  <T extends HybridAppDispatch>(center: Coordinate, name: string | MainMap.ShowableLayer): HybridAppThunk<T> =>
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
