import { getCoordinatesInViewWorld } from '@features/Map/utils'
import { getCoordinatesInWorldCopyOf } from '@utils/worldCopy'

import { VesselLabelLine } from './types/vesselLabelLine'
import { MissionLabelLine } from '../../domain/entities/missionLabelLine'

import type { Coordinate } from 'ol/coordinate'

/**
 * Returns the label line ends within the world copy displayed by the map: the feature coordinates are in the main world
 * whereas the label may have been moved on a world copy, which would draw a line around the globe.
 */
export function getLabelLineCoordinates(
  featureCoordinates: Coordinate,
  labelCoordinates: Coordinate
): [Coordinate, Coordinate] {
  const fromCoordinates = getCoordinatesInViewWorld(featureCoordinates)

  return [fromCoordinates, getCoordinatesInWorldCopyOf(labelCoordinates, fromCoordinates[0]!)]
}

/**
 * @deprecated Do not use this method but instead `drawMovedLabelLine` (see below).
 */
export function drawMovedLabelLineIfFoundAndReturnOffset(
  vectorSource,
  featureIdToCoordinates,
  labelLineFeatureId,
  feature
) {
  let offset = null

  if (featureIdToCoordinates.has(labelLineFeatureId)) {
    const coordinatesAndOffset = featureIdToCoordinates.get(labelLineFeatureId)
    offset = coordinatesAndOffset.offset

    const [fromCoordinates, toCoordinates] = getLabelLineCoordinates(
      feature.getGeometry().getCoordinates(),
      coordinatesAndOffset.coordinates
    )

    const existingLabelLineFeature = vectorSource.getFeatureById(labelLineFeatureId)
    if (existingLabelLineFeature) {
      existingLabelLineFeature.getGeometry().setCoordinates([fromCoordinates, toCoordinates])
    } else {
      const labelLineFeature = VesselLabelLine.getFeature(fromCoordinates, toCoordinates, labelLineFeatureId)
      labelLineFeature.setId(labelLineFeatureId)
      vectorSource.addFeature(labelLineFeature)
    }
  }

  return offset
}

export function drawMovedLabelLine(vectorSource, featureIdToCoordinates, labelLineFeatureId, featureCoordinates) {
  if (featureIdToCoordinates.has(labelLineFeatureId)) {
    const coordinatesAndOffset = featureIdToCoordinates.get(labelLineFeatureId)
    const [fromCoordinates, toCoordinates] = getLabelLineCoordinates(
      featureCoordinates,
      coordinatesAndOffset.coordinates
    )

    const existingLabelLineFeature = vectorSource.getFeatureById(labelLineFeatureId)
    if (!existingLabelLineFeature) {
      const labelLineFeature = MissionLabelLine.getFeature(fromCoordinates, toCoordinates, labelLineFeatureId)
      labelLineFeature.setId(labelLineFeatureId)
      vectorSource.addFeature(labelLineFeature)

      return
    }

    existingLabelLineFeature.getGeometry().setCoordinates([fromCoordinates, toCoordinates])
  }
}
