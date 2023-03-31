import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'

import { LayerProperties } from './layers/constants'
import { getVesselCompositeIdentifier } from './vessel/vessel'

export class VesselLabelLine {
  static opacityProperty = 'opacity'

  /**
   * VesselLabelLine object for building OpenLayers vessel line to label feature
   * @param {string[]} fromCoordinates - The [longitude, latitude] of the start of the line (the vessel position)
   * @param {string[]} toCoordinates - The [longitude, latitude] of the label position
   * @param {string} featureId - The feature identifier
   * @param {number} opacity - The opacity
   */
  static getFeature(fromCoordinates, toCoordinates, featureId, opacity) {
    const labelLineFeature = new Feature({
      geometry: new LineString([fromCoordinates, toCoordinates]),
      opacity
    })
    labelLineFeature.setId(featureId)

    return labelLineFeature
  }

  static getFeatureId(identity) {
    return `${LayerProperties.VESSELS_LABEL.code}:${getVesselCompositeIdentifier(identity)}`
  }
}
