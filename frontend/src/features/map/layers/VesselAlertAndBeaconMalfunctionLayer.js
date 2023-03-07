import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'
import { LayerProperties } from '../../../domain/entities/layers/constants'

import { getVesselAlertAndBeaconMalfunctionStyle } from './styles/vessel.style'
import { getVesselCompositeIdentifier, vesselIsShowed } from '../../../domain/entities/vessel/vessel'

const VesselAlertAndBeaconMalfunctionLayer = ({ map }) => {
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
    hideVesselsAtPort
  } = useSelector(state => state.map)

  const vectorSourceRef = useRef(null)
  function getVectorSource () {
    if (vectorSourceRef.current === null) {
      vectorSourceRef.current = new VectorSource({
        features: [],
        wrapX: false
      })
    }
    return vectorSourceRef.current
  }

  const layerRef = useRef(null)
  function getLayer () {
    if (layerRef.current === null) {
      layerRef.current = new Vector({
        source: getVectorSource(),
        zIndex: LayerProperties.VESSEL_BEACON_MALFUNCTION.zIndex,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        style: (_, resolution) => getVesselAlertAndBeaconMalfunctionStyle(resolution)
      })
    }
    return layerRef.current
  }

  useEffect(() => {
    if (isAdmin && map) {
      getLayer().name = LayerProperties.VESSEL_BEACON_MALFUNCTION.code
      map.getLayers().push(getLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(getLayer())
      }
    }
  }, [isAdmin, map, getLayer])

  useEffect(() => {
    if (isAdmin && vessels?.length) {
      const features = vessels.reduce((_features, vessel) => {
        if (!vessel.hasBeaconMalfunction) return _features
        if (!vessel.vesselProperties.hasAlert) return _features
        if (nonFilteredVesselsAreHidden && !vessel.isFiltered) return _features
        if (previewFilteredVesselsMode && !vessel.filterPreview) return _features
        if (hideVesselsAtPort && vessel.isAtPort) return _features
        if (hideNonSelectedVessels && !vesselIsShowed(vessel.vesselProperties, vesselsTracksShowed, selectedVesselIdentity)) return _features

        const feature = new Feature({
          geometry: new Point(vessel.coordinates)
        })
        feature.setId(`${LayerProperties.VESSEL_BEACON_MALFUNCTION.code}:${getVesselCompositeIdentifier(vessel.vesselProperties)}`)
        _features.push(feature)

        return _features
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
    hideVesselsAtPort
  ])

  return null
}

export default React.memo(VesselAlertAndBeaconMalfunctionLayer)
