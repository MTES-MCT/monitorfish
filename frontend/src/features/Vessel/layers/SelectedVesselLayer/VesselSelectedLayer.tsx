import {
  SELECTED_VESSEL_VECTOR_LAYER,
  SELECTED_VESSEL_VECTOR_SOURCE
} from '@features/Vessel/layers/SelectedVesselLayer/constants'
import { getSelectedVesselStyle } from '@features/Vessel/layers/SelectedVesselLayer/style'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { transform } from 'ol/proj'
import React, { useEffect } from 'react'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../Map/constants'
import { monitorfishMap } from '../../../Map/monitorfishMap'

function VesselSelectedLayerUnmemoized() {
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const vesselsTracksShowed = useMainAppSelector(state => state.vessel.vesselsTracksShowed)
  const selectedBaseLayer = useMainAppSelector(state => state.map.selectedBaseLayer)
  const isLight = VesselFeature.iconIsLight(selectedBaseLayer)

  useEffect(() => {
    SELECTED_VESSEL_VECTOR_LAYER.setStyle(getSelectedVesselStyle(isLight))
  }, [isLight])

  useEffect(() => {
    monitorfishMap.getLayers().push(SELECTED_VESSEL_VECTOR_LAYER)

    return () => {
      monitorfishMap.removeLayer(SELECTED_VESSEL_VECTOR_LAYER)
    }
  }, [])

  useEffect(() => {
    SELECTED_VESSEL_VECTOR_SOURCE.clear(true)

    if (selectedVessel && selectedVessel.lastPositionLongitude && selectedVessel.lastPositionLatitude) {
      const coordinates = transform(
        [selectedVessel.lastPositionLongitude, selectedVessel.lastPositionLatitude],
        WSG84_PROJECTION,
        OPENLAYERS_PROJECTION
      )
      const feature = new Feature({
        course: selectedVessel.lastPositionCourse,
        geometry: new Point(coordinates)
      })
      SELECTED_VESSEL_VECTOR_SOURCE.addFeature(feature)
    }

    if (vesselsTracksShowed) {
      const vesselsTracks = Object.values(vesselsTracksShowed)
      const features = vesselsTracks?.map(vesselTrack => {
        const feature = new Feature({
          course: vesselTrack.course,
          geometry: new Point(vesselTrack.coordinates)
        })
        feature.setId(vesselTrack.vesselCompositeIdentifier)

        return feature
      })
      SELECTED_VESSEL_VECTOR_SOURCE.addFeatures(features)
    }
  }, [selectedVessel, vesselsTracksShowed])

  return null
}

export const VesselSelectedLayer = React.memo(VesselSelectedLayerUnmemoized)
