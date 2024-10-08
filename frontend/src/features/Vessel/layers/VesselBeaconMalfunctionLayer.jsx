import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'
import { LayerProperties } from '../../../domain/entities/layers/constants'

import { getVesselBeaconMalfunctionStyle } from './style'
import { getVesselCompositeIdentifier, vesselIsShowed } from '../../../domain/entities/vessel/vessel'
import { useIsSuperUser } from '../../../auth/hooks/useIsSuperUser'
import { monitorfishMap } from '../../map/monitorfishMap'
import { vesselsAdapter, vesselSelectors } from '../slice'

const VesselBeaconMalfunctionLayer = () => {
  const isSuperUser = useIsSuperUser()
  const hideNonSelectedVessels = useSelector(state => state.vessel.hideNonSelectedVessels)
  const vesselsTracksShowed = useSelector(state => state.vessel.vesselsTracksShowed)
  const selectedVesselIdentity = useSelector(state => state.vessel.selectedVesselIdentity)
  const vessels = useSelector(state => vesselSelectors.selectAll(state.vessel.vessels))
  const nonFilteredVesselsAreHidden = useSelector(state => state.filter.nonFilteredVesselsAreHidden)
  const previewFilteredVesselsMode = useSelector(state => state.global.previewFilteredVesselsMode)
  const hideVesselsAtPort = useSelector(state => state.map.hideVesselsAtPort)

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
        style: (_, resolution) => getVesselBeaconMalfunctionStyle(resolution)
      })
    }
    return layerRef.current
  }

  useEffect(() => {
    if (isSuperUser) {
      getLayer().name = LayerProperties.VESSEL_BEACON_MALFUNCTION.code
      monitorfishMap.getLayers().push(getLayer())
    }

    return () => {
      monitorfishMap.removeLayer(getLayer())
    }
  }, [isSuperUser, getLayer])

  useEffect(() => {
    if (isSuperUser && vessels?.length) {
      const features = vessels.reduce((_features, vessel) => {
        if (!vessel.hasBeaconMalfunction) return _features
        if (vessel.hasAlert) return _features
        if (nonFilteredVesselsAreHidden && !vessel.isFiltered) return _features
        if (previewFilteredVesselsMode && !vessel.filterPreview) return _features
        if (hideVesselsAtPort && vessel.isAtPort) return _features
        if (hideNonSelectedVessels && !vesselIsShowed(vessel, vesselsTracksShowed, selectedVesselIdentity)) return _features

        const feature = new Feature({
          geometry: new Point(vessel.coordinates)
        })
        feature.setId(`${LayerProperties.VESSEL_BEACON_MALFUNCTION.code}:${getVesselCompositeIdentifier(vessel)}`)
        _features.push(feature)

        return _features
      }, [])

      getVectorSource()?.clear(true)
      getVectorSource()?.addFeatures(features)
    }
  }, [
    isSuperUser,
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
