import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'
import Layers from '../domain/entities/layers'

import { getVesselBeaconMalfunctionStyle } from './styles/vessel.style'
import { getVesselId, vesselIsShowed } from '../domain/entities/vessel'

const VesselBeaconMalfunctionLayer = ({ map }) => {
  const {
    vessels,
    hideNonSelectedVessels,
    vesselsTracksShowed,
    selectedVesselIdentity
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
        zIndex: Layers.VESSEL_BEACON_MALFUNCTION.zIndex,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        style: (_, resolution) => getVesselBeaconMalfunctionStyle(resolution)
      })
    }
    return layerRef.current
  }

  useEffect(() => {
    if (isAdmin && map) {
      getLayer().name = Layers.VESSEL_BEACON_MALFUNCTION.code
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
        if (vessel.vesselProperties.hasAlert) return _features
        if (nonFilteredVesselsAreHidden && !vessel.isFiltered) return _features
        if (previewFilteredVesselsMode && !vessel.filterPreview) return _features
        if (hideVesselsAtPort && vessel.isAtPort) return _features
        if (hideNonSelectedVessels && !vesselIsShowed(vessel.vesselProperties, vesselsTracksShowed, selectedVesselIdentity)) return _features

        const feature = new Feature({
          geometry: new Point(vessel.coordinates)
        })
        feature.setId(`${Layers.VESSEL_BEACON_MALFUNCTION.code}:${getVesselId(vessel.vesselProperties)}`)
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

export default React.memo(VesselBeaconMalfunctionLayer)
