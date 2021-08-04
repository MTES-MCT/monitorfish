import { animateToRegulatoryLayer } from '../shared_slices/Map'
import Layers from '../entities/layers'
import { getCenter } from 'ol/extent'

const dispatchAnimateToRegulatoryLayer = (center, dispatch, className) => {
  if (center && center.length && !Number.isNaN(center[0]) && !Number.isNaN(center[1])) {
    dispatch(animateToRegulatoryLayer({
      name: className,
      center: center
    }))
  }
}
const zoomInLayer = ({ subZone, feature }) => (dispatch, getState) => {
  if (subZone) {
    const className = `${Layers.REGULATORY.code}:${subZone.topic}:${subZone.zone}`
    const layerToZoomIn = getState().layer.layers.find(layer => layer.className_ === className)
    if (layerToZoomIn) {
      const center = getCenter(layerToZoomIn.getSource().getExtent())
      dispatchAnimateToRegulatoryLayer(center, dispatch, className)
    }
  } else if (feature) {
    const center = getCenter(feature.getGeometry().getExtent())
    dispatchAnimateToRegulatoryLayer(center, dispatch, Layers.REGULATORY_PREVIEW)
  }
}

export default zoomInLayer
