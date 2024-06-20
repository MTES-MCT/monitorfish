export enum InterestPointType {
  CONTROL_ENTITY = 'CONTROL_ENTITY',
  FISHING_GEAR = 'FISHING_GEAR',
  FISHING_VESSEL = 'FISHING_VESSEL',
  OTHER = 'OTHER'
}

export const INTEREST_POINT_STYLE = 150

export function coordinatesOrTypeAreModified(drawingFeatureToUpdate, interestPointBeingDrawed) {
  return (
    !Number.isNaN(drawingFeatureToUpdate.getGeometry().getCoordinates()[0]) &&
    !Number.isNaN(drawingFeatureToUpdate.getGeometry().getCoordinates()[1]) &&
    !Number.isNaN(interestPointBeingDrawed.coordinates[0]) &&
    !Number.isNaN(interestPointBeingDrawed.coordinates[1]) &&
    (drawingFeatureToUpdate.getGeometry().getCoordinates()[0] !== interestPointBeingDrawed.coordinates[0] ||
      drawingFeatureToUpdate.getGeometry().getCoordinates()[1] !== interestPointBeingDrawed.coordinates[1] ||
      drawingFeatureToUpdate.getProperties().type !== interestPointBeingDrawed.type)
  )
}

export function coordinatesAreModified(feature, previousFeature) {
  return (
    feature &&
    previousFeature &&
    feature.coordinates &&
    previousFeature.coordinates &&
    !Number.isNaN(feature.coordinates[0]) &&
    !Number.isNaN(feature.coordinates[1]) &&
    !Number.isNaN(previousFeature.coordinates[0]) &&
    !Number.isNaN(previousFeature.coordinates[1]) &&
    (feature.coordinates[0] !== previousFeature.coordinates[0] ||
      feature.coordinates[1] !== previousFeature.coordinates[1])
  )
}
