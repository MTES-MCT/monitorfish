import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'
import Layers from '../domain/entities/layers'

import { getVesselAlertStyle } from './styles/vessel.style'
import {
  getVesselFeatureIdFromVessel,
  getVesselLastPositionVisibilityDates,
  vesselsAreEquals,
  Vessel
} from '../domain/entities/vessel'
const VesselAlertLayer = ({ map }) => {
  const {
    vessels,
    hideNonSelectedVessels,
    selectedVessel
  } = useSelector(state => state.vessel)

  const {
    nonFilteredVesselsAreHidden
  } = useSelector(state => state.filter)

  const {
    previewFilteredVesselsMode
  } = useSelector(state => state.global)

  const {
    vesselsLastPositionVisibility,
    hideVesselsAtPort
  } = useSelector(state => state.map)

  const vectorSourceRef = useRef(new VectorSource({
    features: []
  }))
  const layerRef = useRef(new Vector({
    renderBuffer: 4,
    source: vectorSourceRef.current,
    zIndex: Layers.VESSEL_ALERT.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: (feature, resolution) => getVesselAlertStyle(feature, resolution)
  }))

  useEffect(() => {
    if (map) {
      layerRef.current.name = Layers.VESSEL_ALERT.code
      map.getLayers().push(layerRef.current)
    }

    return () => {
      if (map) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map])

  useEffect(() => {
    if (vessels?.length) {
      const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

      const features = vessels.reduce((features, vessel) => {
        if (!vessel.vesselProperties.hasAlert) return features
        if (nonFilteredVesselsAreHidden && !vessel.isFiltered) return features
        if (previewFilteredVesselsMode && !vessel.filterPreview) return features
        if (hideVesselsAtPort && vessel.isAtPort) return features
        if (hideNonSelectedVessels && !vesselsAreEquals(vessel.vesselProperties, selectedVessel)) return features
        if (!Vessel.getVesselOpacity(vessel.vesselProperties.dateTime, vesselIsHidden, vesselIsOpacityReduced)) return features

        const feature = new Feature({
          geometry: new Point(vessel.coordinates)
        })
        feature.setId(`${Layers.VESSEL_ALERT.code}:${getVesselFeatureIdFromVessel(vessel.vesselProperties)}`)
        features.push(feature)

        return features
      }, [])

      vectorSourceRef.current?.clear(true)
      vectorSourceRef.current?.addFeatures(features)
    }
  }, [
    vessels,
    selectedVessel,
    previewFilteredVesselsMode,
    nonFilteredVesselsAreHidden,
    hideNonSelectedVessels,
    hideVesselsAtPort,
    vesselsLastPositionVisibility?.opacityReduced,
    vesselsLastPositionVisibility?.hidden
  ])

  return null
}

export default VesselAlertLayer
