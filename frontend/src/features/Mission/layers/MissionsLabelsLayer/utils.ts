import { MissionAction } from '@features/Mission/missionAction.types'

import { MissionLabelLine } from '../../../../domain/entities/missionLabelLine'
import { drawMovedLabelLine } from '../../../../domain/entities/vessel/label'

import type { FeatureAndLabel } from './types'
import type { LegacyControlUnit } from '../../../ControlUnit/legacyControlUnit'

import FrontCompletionStatus = MissionAction.FrontCompletionStatus

const NOT_FOUND = -1
const MAX_MISSIONS_LABELS_DISPLAYED = 13

export function getFeaturesAndLabels(featureIdToCoordinates, feature, labelLineFeatureId) {
  const controlUnits = feature.get('controlUnits') as LegacyControlUnit.LegacyControlUnit[]
  const label = controlUnits.map(controlUnit => controlUnit.name).join(', ')
  const offset = featureIdToCoordinates.get(labelLineFeatureId)?.offset
  const missionCompletion = feature.get('missionCompletion')

  return {
    color: feature.get('color'),
    coordinates: feature.getGeometry().getCoordinates(),
    featureId: labelLineFeatureId,
    isDoneAndIncomplete: missionCompletion === FrontCompletionStatus.TO_COMPLETE_MISSION_ENDED,
    label,
    offset
  }
}

export function getLabelsOfFeaturesInExtent(
  isHidden,
  vectorSource,
  missionsLayerSource,
  extent,
  featureIdToCoordinates
) {
  if (isHidden) {
    return []
  }

  const featuresInExtent = missionsLayerSource.getFeaturesInExtent(extent) || []
  if (featuresInExtent.length > MAX_MISSIONS_LABELS_DISPLAYED) {
    return []
  }

  return featuresInExtent.map(feature => {
    const labelLineFeatureId = MissionLabelLine.getFeatureId(feature.get('missionId'))
    const missionFeatureCoordinates = feature.getGeometry().getCoordinates()

    drawMovedLabelLine(vectorSource, featureIdToCoordinates, labelLineFeatureId, missionFeatureCoordinates)

    return getFeaturesAndLabels(featureIdToCoordinates, feature, labelLineFeatureId)
  })
}

export function clearPreviousLineFeatures(
  previousFeaturesAndLabels: FeatureAndLabel[] | undefined,
  featuresAndLabels: FeatureAndLabel[],
  vectorSource
) {
  if (!previousFeaturesAndLabels) {
    return
  }

  const previousFeatureIdsList = previousFeaturesAndLabels.map(featureAndLabels => featureAndLabels.featureId)
  const featureIdsList = featuresAndLabels.map(featureAndLabels => featureAndLabels.featureId)

  previousFeatureIdsList.forEach(id => {
    if (featureIdsList.indexOf(id) === NOT_FOUND) {
      const feature = vectorSource.getFeatureById(id)
      if (feature) {
        vectorSource.removeFeature(feature)
      }
    }
  })
}
