import { animateToRegulatoryLayer } from '../reducers/Map'
import Layers from '../entities/layers'
import { getCenter } from 'ol/extent'

const zoomInSubZone = subZone => (dispatch, getState) => {
  if (subZone) {
    const layerName = `${Layers.REGULATORY.code}:${subZone.layerName}:${subZone.zone}`
    const layerToZoomIn = getState().layer.layers.find(layer => layer.className_ === layerName)

    if (layerToZoomIn) {
      const center = getCenter(layerToZoomIn.getSource().getExtent())

      if (center && center.length && !Number.isNaN(center[0]) && !Number.isNaN(center[1])) {
        dispatch(animateToRegulatoryLayer({
          name: layerName,
          center: center
        }))
      }
    }
  }
}

export default zoomInSubZone
