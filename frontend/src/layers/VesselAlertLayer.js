import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'
import { Layer } from '../domain/entities/layers/constants'

import { getVesselAlertStyle } from './styles/vessel.style'
import { getVesselCompositeIdentifier, getVesselLastPositionVisibilityDates, Vessel, vesselIsShowed } from '../domain/entities/vessel/vessel'

const VesselAlertLayer = ({ map }) => {
  const {
    vessels,
    hideNonSelectedVessels,
    selectedVesselIdentity,
    vesselsTracksShowed
  } = useSelector(state => state.vessel)

  const {
    nonFilteredVesselsAreHidden
  } = useSelector(state => state.filter)

  const {
    previewFilteredVesselsMode,
    isAdmin
  } = useSelector(state => state.global)

  const {
    vesselsLastPositionVisibility,
    hideVesselsAtPort
  } = useSelector(state => state.map)

  const vectorSourceRef = useRef(null)
  const layerRef = useRef(null)

  function getVectorSource () {
    if (vectorSourceRef.current === null) {
      vectorSourceRef.current = new VectorSource({
        features: [],
        wrapX: false
      })
    }
    return vectorSourceRef.current
  }

  function getLayer () {
    if (layerRef.current === null) {
      layerRef.current = new Vector({
        source: getVectorSource(),
        zIndex: Layer.VESSEL_ALERT.zIndex,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        style: (feature, resolution) => getVesselAlertStyle(feature, resolution)
      })
    }
    return layerRef.current
  }

  useEffect(() => {
    if (isAdmin && map) {
      getLayer().name = Layer.VESSEL_ALERT.code
      map.getLayers().push(getLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(getLayer())
      }
    }
  }, [isAdmin, map])

  useEffect(() => {
    if (isAdmin && vessels?.length) {
      const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

      const features = vessels.reduce((features, vessel) => {
        if (!vessel.vesselProperties.hasAlert) return features
        if (vessel.hasBeaconMalfunction) return features
        if (nonFilteredVesselsAreHidden && !vessel.isFiltered) return features
        if (previewFilteredVesselsMode && !vessel.filterPreview) return features
        if (hideVesselsAtPort && vessel.isAtPort) return features
        if (hideNonSelectedVessels && !vesselIsShowed(vessel.vesselProperties, vesselsTracksShowed, selectedVesselIdentity)) return features
        if (!Vessel.getVesselOpacity(vessel.vesselProperties.dateTime, vesselIsHidden, vesselIsOpacityReduced)) return features

        const feature = new Feature({
          geometry: new Point(vessel.coordinates)
        })
        feature.setId(`${Layer.VESSEL_ALERT.code}:${getVesselCompositeIdentifier(vessel.vesselProperties)}`)
        features.push(feature)

        return features
      }, [])

      getVectorSource()?.clear(true)
      getVectorSource()?.addFeatures(features)
    }
  }, [
    isAdmin,
    vessels,
    selectedVesselIdentity,
    vesselsTracksShowed,
    previewFilteredVesselsMode,
    nonFilteredVesselsAreHidden,
    hideNonSelectedVessels,
    hideVesselsAtPort,
    vesselsLastPositionVisibility?.opacityReduced,
    vesselsLastPositionVisibility?.hidden
  ])

  return null
}

export default React.memo(VesselAlertLayer)
