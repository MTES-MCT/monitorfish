import LineString from 'ol/geom/LineString'
import { useCallback, useState } from 'react'

import { VesselLabelLine } from '../../../../domain/entities/vesselLabelLine'

export function useGetLineFeatureIdToCoordinates(vectorSource) {
  const [featureIdToCoordinates, setFeatureIdToCoordinates] = useState(new Map())

  const moveVesselLabelLine = useCallback(
    (featureId, fromCoordinates, toCoordinates, offset, opacity) => {
      if (featureIdToCoordinates.has(featureId)) {
        const existingLabelLineFeature = vectorSource.getFeatureById(featureId)
        if (existingLabelLineFeature) {
          existingLabelLineFeature.setGeometry(new LineString([fromCoordinates, toCoordinates]))
        }
      } else {
        const labelLineFeature = VesselLabelLine.getFeature(fromCoordinates, toCoordinates, featureId, opacity)

        vectorSource.addFeature(labelLineFeature)
      }

      const nextVesselToCoordinates = featureIdToCoordinates
      nextVesselToCoordinates.set(featureId, { coordinates: toCoordinates, offset })
      setFeatureIdToCoordinates(nextVesselToCoordinates)
    },
    [featureIdToCoordinates, vectorSource]
  )

  return { lineFeatureIdToCoordinates: featureIdToCoordinates, moveVesselLabelLine }
}
