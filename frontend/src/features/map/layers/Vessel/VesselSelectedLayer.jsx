import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'
import { transform } from 'ol/proj'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../../domain/entities/map/constants'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { Vessel } from '../../../../domain/entities/vessel/vessel'

import { getSelectedVesselStyle } from './style'
import { monitorfishMap } from '../../monitorfishMap'

const VesselSelectedLayer = () => {
  const { selectedVessel, vesselsTracksShowed } = useSelector(state => state.vessel)
  const { selectedBaseLayer } = useSelector(state => state.map)

  const vectorSourceRef = useRef(new VectorSource({
    features: [],
    wrapX: false
  }))
  const isLight = Vessel.iconIsLight(selectedBaseLayer)
  const style = getSelectedVesselStyle({ isLight })
  const layerRef = useRef(new Vector({
    renderBuffer: 4,
    source: vectorSourceRef.current,
    zIndex: LayerProperties.SELECTED_VESSEL.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style
  }))

  useEffect(() => {
    layerRef.current?.setStyle(getSelectedVesselStyle({ isLight }))
  }, [isLight])

  useEffect(() => {
    layerRef.current.name = LayerProperties.SELECTED_VESSEL.code
    monitorfishMap.getLayers().push(layerRef.current)

    return () => {
      monitorfishMap.removeLayer(layerRef.current)
    }
  }, [])

  useEffect(() => {
    vectorSourceRef.current?.clear(true)

    if (selectedVessel) {
      const coordinates = transform([selectedVessel.longitude, selectedVessel.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
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
        feature.setId(vesselTrack.vesselCompositeIdentifier)
        return feature
      })
      vectorSourceRef.current?.addFeatures(features)
    }
  }, [selectedVessel, vesselsTracksShowed])

  return null
}

export default React.memo(VesselSelectedLayer)
