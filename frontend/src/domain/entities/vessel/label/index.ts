import { MissionLabelLine } from '../../missionLabelLine'
import { VesselLabelLine } from '../../vesselLabelLine'

/**
 * @deprecated Do not use this method but instead `drawMovedLabelLineIfFound` (see below).
 */
export function drawMovedLabelLineIfFoundAndReturnOffset(
  vectorSource,
  featureIdToCoordinates,
  labelLineFeatureId,
  feature,
  opacity
) {
  let offset = null

  if (featureIdToCoordinates.has(labelLineFeatureId)) {
    const coordinatesAndOffset = featureIdToCoordinates.get(labelLineFeatureId)
    offset = coordinatesAndOffset.offset

    const existingLabelLineFeature = vectorSource.getFeatureById(labelLineFeatureId)
    if (existingLabelLineFeature) {
      existingLabelLineFeature
        .getGeometry()
        .setCoordinates([feature.getGeometry().getCoordinates(), coordinatesAndOffset.coordinates])
    } else {
      const labelLineFeature = VesselLabelLine.getFeature(
        feature.getGeometry().getCoordinates(),
        coordinatesAndOffset.coordinates,
        labelLineFeatureId,
        opacity
      )
      labelLineFeature.setId(labelLineFeatureId)
      vectorSource.addFeature(labelLineFeature)
    }
  }

  return offset
}

export function drawMovedLabelLine(vectorSource, featureIdToCoordinates, labelLineFeatureId, featureCoordinates) {
  if (featureIdToCoordinates.has(labelLineFeatureId)) {
    const coordinatesAndOffset = featureIdToCoordinates.get(labelLineFeatureId)

    const existingLabelLineFeature = vectorSource.getFeatureById(labelLineFeatureId)
    if (!existingLabelLineFeature) {
      const labelLineFeature = MissionLabelLine.getFeature(
        featureCoordinates,
        coordinatesAndOffset.coordinates,
        labelLineFeatureId
      )
      labelLineFeature.setId(labelLineFeatureId)
      vectorSource.addFeature(labelLineFeature)

      return
    }

    existingLabelLineFeature.getGeometry().setCoordinates([featureCoordinates, coordinatesAndOffset.coordinates])
  }
}
