import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import {
  SELECTED_VESSEL_VECTOR_LAYER,
  SELECTED_VESSEL_VECTOR_SOURCE
} from '@features/Vessel/layers/SelectedVesselLayer/constants'
import { getSelectedVesselStyle } from '@features/Vessel/layers/SelectedVesselLayer/style'
import { selectSelectedVesselMarkerPosition } from '@features/Vessel/selectors/selectedVesselMarkerPosition'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { transform } from 'ol/proj'
import React, { useEffect } from 'react'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../Map/constants'

function VesselSelectedLayerUnmemoized() {
  const selectedVesselMarkerPosition = useMainAppSelector(selectSelectedVesselMarkerPosition)
  const vesselsTracksShowed = useMainAppSelector(state => state.vessel.vesselsTracksShowed)
  const selectedBaseLayer = useMainAppSelector(state => state.map.selectedBaseLayer)
  const isLight = VesselFeature.iconIsLight(selectedBaseLayer)

  useEffect(() => {
    SELECTED_VESSEL_VECTOR_LAYER.setStyle(getSelectedVesselStyle(isLight))
  }, [isLight])

  useMapLayer(SELECTED_VESSEL_VECTOR_LAYER)

  useEffect(() => {
    SELECTED_VESSEL_VECTOR_SOURCE.clear(true)

    if (selectedVesselMarkerPosition) {
      const coordinates = transform(
        [selectedVesselMarkerPosition.longitude, selectedVesselMarkerPosition.latitude],
        WSG84_PROJECTION,
        OPENLAYERS_PROJECTION
      )
      const feature = new Feature({
        course: selectedVesselMarkerPosition.course,
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
  }, [selectedVesselMarkerPosition, vesselsTracksShowed])

  return null
}

export const VesselSelectedLayer = React.memo(VesselSelectedLayerUnmemoized)
