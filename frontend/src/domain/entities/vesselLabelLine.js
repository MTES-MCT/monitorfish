import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import { Layer } from './layers/constants'
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
  static getFeature (fromCoordinates, toCoordinates, featureId, opacity) {
    const labelLineFeature = new Feature({
      opacity,
      geometry: new LineString([fromCoordinates, toCoordinates])
    })
    labelLineFeature.setId(featureId)

    return labelLineFeature
  }

  static getFeatureId (identity) {
    return `${Layer.VESSELS_LABEL.code}:${getVesselCompositeIdentifier(identity)}`
  }
}

export function drawMovedLabelIfFoundAndReturnOffset (vectorSource, vesselToCoordinates, labelLineFeatureId, feature, opacity) {
  let offset = null

  if (vesselToCoordinates.has(labelLineFeatureId)) {
    const coordinatesAndOffset = vesselToCoordinates.get(labelLineFeatureId)
    offset = coordinatesAndOffset.offset

    const existingLabelLineFeature = vectorSource.getFeatureById(labelLineFeatureId)
    if (existingLabelLineFeature) {
      existingLabelLineFeature.getGeometry().setCoordinates([feature.getGeometry().getCoordinates(), coordinatesAndOffset.coordinates])
    } else {
      const labelLineFeature = VesselLabelLine.getFeature(
        feature.getGeometry().getCoordinates(),
        coordinatesAndOffset.coordinates,
        labelLineFeatureId,
        opacity)
      labelLineFeature.setId(labelLineFeatureId)
      vectorSource.addFeature(labelLineFeature)
    }
  }
  return offset
}
