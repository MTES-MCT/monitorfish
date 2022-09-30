import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'
import { transform } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import Layers from '../domain/entities/layers'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import { Vessel } from '../domain/entities/vessel'
import { getSelectedVesselStyle } from './styles/vessel.style'

function VesselSelectedLayer({ map }) {
  const { selectedVessel, vesselsTracksShowed } = useSelector(state => state.vessel)
  const { selectedBaseLayer } = useSelector(state => state.map)

  const vectorSourceRef = useRef(
    new VectorSource({
      features: [],
      wrapX: false
    })
  )
  const isLight = Vessel.iconIsLight(selectedBaseLayer)
  const style = getSelectedVesselStyle({ isLight })
  const layerRef = useRef(
    new Vector({
      renderBuffer: 4,
      source: vectorSourceRef.current,
      style,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      zIndex: Layers.SELECTED_VESSEL.zIndex
    })
  )

  useEffect(() => {
    layerRef.current?.setStyle(getSelectedVesselStyle({ isLight }))
  }, [isLight])

  useEffect(() => {
    if (map) {
      layerRef.current.name = Layers.SELECTED_VESSEL.code
      map.getLayers().push(layerRef.current)
    }

    return () => {
      if (map) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map])

  useEffect(() => {
    vectorSourceRef.current?.clear(true)

    if (selectedVessel) {
      const coordinates = transform(
        [selectedVessel.longitude, selectedVessel.latitude],
        WSG84_PROJECTION,
        OPENLAYERS_PROJECTION
      )
      const feature = new Feature({
        ...selectedVessel,
        geometry: new Point(coordinates)
      })
      vectorSourceRef.current?.addFeature(feature)
    }

    if (vesselsTracksShowed) {
      const vesselsTracks = Object.values(vesselsTracksShowed)
      const features = vesselsTracks?.map(vesselTrack => {
        const feature = new Feature({
          course: vesselTrack.course,
          geometry: new Point(vesselTrack.coordinates)
        })
        feature.setId(vesselTrack.vesselId)

        return feature
      })
      vectorSourceRef.current?.addFeatures(features)
    }
  }, [selectedVessel, vesselsTracksShowed])

  return null
}

export default React.memo(VesselSelectedLayer)
