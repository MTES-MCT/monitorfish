import { getCenter } from 'ol/extent'

import { LayerProperties } from '../../../domain/entities/layers/constants'
import { mapActions } from '../../../domain/shared_slices/Map'
import { isNumeric } from '../../../utils/isNumeric'

import type {
  BackofficeAppDispatch,
  BackofficeAppGetState,
  BackofficeAppThunk,
  MainAppDispatch,
  MainAppGetState,
  MainAppThunk
} from '@store'
import type { ShowableLayer, ShowedLayer } from 'domain/entities/layers/types'
import type { Feature } from 'ol'
import type { Coordinate } from 'ol/coordinate'

type Params = {
  feature?: Feature | undefined
  topicAndZone?: ShowedLayer
}

export function zoomInLayer<T extends BackofficeAppThunk | MainAppThunk>(layer: Params): T
export function zoomInLayer(layer: Params): MainAppThunk | BackofficeAppThunk {
  return (dispatch: BackofficeAppDispatch | MainAppDispatch, getState: BackofficeAppGetState | MainAppGetState) => {
    if (layer.topicAndZone) {
      const name = `${LayerProperties.REGULATORY.code}:${layer.topicAndZone.topic}:${layer.topicAndZone.zone}`
      const layerToZoomIn = getState().layer.layersToFeatures.find(layerFeature => layerFeature.name === name)
      if (layerToZoomIn) {
        dispatchAnimateToRegulatoryLayer(dispatch, layerToZoomIn.center, name)
      }
    } else if (layer.feature) {
      const extent = layer.feature.getGeometry()?.getExtent()
      if (!extent) {
        return
      }

      const center = getCenter(extent)
      dispatchAnimateToRegulatoryLayer(dispatch, center, LayerProperties.REGULATORY_PREVIEW)
    }
  }
}

const dispatchAnimateToRegulatoryLayer = (
  dispatch: BackofficeAppDispatch | MainAppDispatch,
  center: Coordinate,
  name: string | ShowableLayer
) => {
  if (center?.length && isNumeric(center[0]) && isNumeric(center[1])) {
    dispatch(
      mapActions.animateToRegulatoryLayer({
        center,
        name
      })
    )
  }
}
