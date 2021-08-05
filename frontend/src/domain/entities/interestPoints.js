export const interestPointType = {
  CONTROL_ENTITY: 'CONTROL_ENTITY',
  FISHING_VESSEL: 'FISHING_VESSEL',
  FISHING_GEAR: 'FISHING_GEAR',
  OTHER: 'OTHER'
}

export const INTEREST_POINT_STYLE = 150

export function coordinatesOrTypeAreModified (drawingFeatureToUpdate, interestPointBeingDrawed) {
  return (
    !isNaN(drawingFeatureToUpdate.getGeometry().getCoordinates()[0]) &&
    !isNaN(drawingFeatureToUpdate.getGeometry().getCoordinates()[1]) &&
    !isNaN(interestPointBeingDrawed.coordinates[0]) &&
    !isNaN(interestPointBeingDrawed.coordinates[1])
  ) &&
    (
      drawingFeatureToUpdate.getGeometry().getCoordinates()[0] !== interestPointBeingDrawed.coordinates[0] ||
      drawingFeatureToUpdate.getGeometry().getCoordinates()[1] !== interestPointBeingDrawed.coordinates[1] ||
      drawingFeatureToUpdate.getProperties().type !== interestPointBeingDrawed.type
    )
}

export function coordinatesAreModified (feature, previousFeature) {
  return (
    feature &&
    previousFeature &&
    feature.coordinates &&
    previousFeature.coordinates &&
    !isNaN(feature.coordinates[0]) &&
    !isNaN(feature.coordinates[1]) &&
    !isNaN(previousFeature.coordinates[0]) &&
    !isNaN(previousFeature.coordinates[1])
  ) &&
  (
    feature.coordinates[0] !== previousFeature.coordinates[0] ||
    feature.coordinates[1] !== previousFeature.coordinates[1]
  )
}
