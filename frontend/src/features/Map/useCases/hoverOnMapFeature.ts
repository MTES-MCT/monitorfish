import { REPORTINGS_VECTOR_SOURCE } from '@features/Reporting/layers/ReportingLayer/constants'
import { FeatureWithCodeAndEntityId } from '@libs/FeatureWithCodeAndEntityId'

import { LayerProperties } from '../constants'

import type { Feature } from 'ol'

export const hoverOnMapFeature = (feature: Feature | FeatureWithCodeAndEntityId | undefined) => {
  const hoveredFeatureId = feature?.getId()?.toString()
  if (!hoveredFeatureId) {
    resetHoveredFeatures()

    return
  }

  if (hoveredFeatureId.includes(LayerProperties.REPORTING.code)) {
    feature?.set('isHovered', true)
  }
}

function resetHoveredFeatures() {
  const reportingFeatureToRemove = REPORTINGS_VECTOR_SOURCE.getFeatures().find(
    feature => feature?.get('isHovered') === true
  )

  if (reportingFeatureToRemove) {
    reportingFeatureToRemove.set('isHovered', false)
    REPORTINGS_VECTOR_SOURCE.changed()
  }
}
