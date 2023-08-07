import { animateToRegulatoryLayer } from '../../shared_slices/Map'
import { LayerProperties } from '../../entities/layers/constants'
import { getCenter } from 'ol/extent'
import { isNumeric } from '../../../utils/isNumeric'

/**
 *
 * @param {{
 *  feature?: any
 *  topicAndZone?: any
 * }} layer
 *
 * @returns {any}
 */
const zoomInLayer = ({ topicAndZone, feature }) => (dispatch, getState) => {
  if (topicAndZone) {
    const name = `${LayerProperties.REGULATORY.code}:${topicAndZone.topic}:${topicAndZone.zone}`
    const layerToZoomIn = getState().layer.layersToFeatures.find(layer => layer.name === name)
    if (layerToZoomIn) {
      dispatchAnimateToRegulatoryLayer(layerToZoomIn.center, dispatch, name)
    }
  } else if (feature) {
    const center = getCenter(feature.getGeometry().getExtent())
    dispatchAnimateToRegulatoryLayer(center, dispatch, LayerProperties.REGULATORY_PREVIEW)
  }
}

const dispatchAnimateToRegulatoryLayer = (center, dispatch, name) => {
  if (center?.length && isNumeric(center[0]) && isNumeric(center[1])) {
    dispatch(animateToRegulatoryLayer({
      name: name,
      center: center
    }))
  }
}

export default zoomInLayer
