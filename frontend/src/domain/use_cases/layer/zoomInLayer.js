import { getCenter } from 'ol/extent'

import Layers from '../../entities/layers'
import { animateToRegulatoryLayer } from '../../shared_slices/Map'

const zoomInLayer =
  ({ feature, topicAndZone }) =>
  (dispatch, getState) => {
    if (topicAndZone) {
      const name = `${Layers.REGULATORY.code}:${topicAndZone.topic}:${topicAndZone.zone}`
      const layerToZoomIn = getState().layer.layersToFeatures.find(layer => layer.name === name)
      if (layerToZoomIn) {
        dispatchAnimateToRegulatoryLayer(layerToZoomIn.center, dispatch, name)
      }
    } else if (feature) {
      const center = getCenter(feature.getGeometry().getExtent())
      dispatchAnimateToRegulatoryLayer(center, dispatch, Layers.REGULATORY_PREVIEW)
    }
  }

const dispatchAnimateToRegulatoryLayer = (center, dispatch, name) => {
  if (center?.length && !Number.isNaN(center[0]) && !Number.isNaN(center[1])) {
    dispatch(
      animateToRegulatoryLayer({
        center,
        name,
      }),
    )
  }
}

export default zoomInLayer
