import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'

import { LayerProperties } from './layers/constants'

export class MissionLabelLine {
  /**
   * MissionLabelLine object for building OpenLayers vessel line to label feature
   * @param {string[]} fromCoordinates - The [longitude, latitude] of the start of the line (the mission position)
   * @param {string[]} toCoordinates - The [longitude, latitude] of the label position
   * @param {string} featureId - The feature identifier
   */
  static getFeature(fromCoordinates, toCoordinates, featureId) {
    const labelLineFeature = new Feature({
      geometry: new LineString([fromCoordinates, toCoordinates])
    })
    labelLineFeature.setId(featureId)

    return labelLineFeature
  }

  static getFeatureId(id: number) {
    return `${LayerProperties.MISSIONS_LABEL.code}:${id}`
  }
}
