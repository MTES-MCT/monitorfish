import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'
import Layers from '../domain/entities/layers'

import { getVesselAlertStyle } from './styles/vessel.style'
import {
  getVesselId,
  getVesselLastPositionVisibilityDates,
  Vessel,
  vesselsAreEquals
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
    previewFilteredVesselsMode,
    adminRole
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
        zIndex: Layers.VESSEL_ALERT.zIndex,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        style: (feature, resolution) => getVesselAlertStyle(feature, resolution)
      })
    }
    return layerRef.current
  }

  useEffect(() => {
    if (adminRole && map) {
      getLayer().name = Layers.VESSEL_ALERT.code
      map.getLayers().push(getLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(getLayer())
      }
    }
  }, [adminRole, map])

  useEffect(() => {
    if (adminRole && vessels?.length) {
      const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

      const features = vessels.reduce((features, vessel) => {
        if (!vessel.vesselProperties.hasAlert) return features
        if (vessel.hasBeaconMalfunction) return features
        if (nonFilteredVesselsAreHidden && !vessel.isFiltered) return features
        if (previewFilteredVesselsMode && !vessel.filterPreview) return features
        if (hideVesselsAtPort && vessel.isAtPort) return features
        if (hideNonSelectedVessels && !vesselsAreEquals(vessel.vesselProperties, selectedVessel)) return features
        if (!Vessel.getVesselOpacity(vessel.vesselProperties.dateTime, vesselIsHidden, vesselIsOpacityReduced)) return features

        const feature = new Feature({
          geometry: new Point(vessel.coordinates)
        })
        feature.setId(`${Layers.VESSEL_ALERT.code}:${getVesselId(vessel.vesselProperties)}`)
        features.push(feature)

        return features
      }, [])

      getVectorSource()?.clear(true)
      getVectorSource()?.addFeatures(features)
    }
  }, [
    adminRole,
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
