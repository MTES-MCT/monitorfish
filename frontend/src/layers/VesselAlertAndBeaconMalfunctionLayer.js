import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import Layers from '../domain/entities/layers'
import { getVesselId, vesselIsShowed } from '../domain/entities/vessel'
import { getVesselAlertAndBeaconMalfunctionStyle } from './styles/vessel.style'

function VesselAlertAndBeaconMalfunctionLayer({ map }) {
  const { hideNonSelectedVessels, selectedVesselIdentity, vessels, vesselsTracksShowed } = useSelector(
    state => state.vessel,
  )

  const { nonFilteredVesselsAreHidden } = useSelector(state => state.filter)

  const { adminRole, previewFilteredVesselsMode } = useSelector(state => state.global)

  const { hideVesselsAtPort } = useSelector(state => state.map)

  const vectorSourceRef = useRef(null)
  function getVectorSource() {
    if (vectorSourceRef.current === null) {
      vectorSourceRef.current = new VectorSource({
        features: [],
        wrapX: false,
      })
    }

    return vectorSourceRef.current
  }

  const layerRef = useRef(null)
  function getLayer() {
    if (layerRef.current === null) {
      layerRef.current = new Vector({
        source: getVectorSource(),
        style: (_, resolution) => getVesselAlertAndBeaconMalfunctionStyle(resolution),
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: Layers.VESSEL_BEACON_MALFUNCTION.zIndex,
      })
    }

    return layerRef.current
  }

  useEffect(() => {
    if (adminRole && map) {
      getLayer().name = Layers.VESSEL_BEACON_MALFUNCTION.code
      map.getLayers().push(getLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(getLayer())
      }
    }
  }, [adminRole, map, getLayer])

  useEffect(() => {
    if (adminRole && vessels?.length) {
      const features = vessels.reduce((_features, vessel) => {
        if (!vessel.hasBeaconMalfunction) {
          return _features
        }
        if (!vessel.vesselProperties.hasAlert) {
          return _features
        }
        if (nonFilteredVesselsAreHidden && !vessel.isFiltered) {
          return _features
        }
        if (previewFilteredVesselsMode && !vessel.filterPreview) {
          return _features
        }
        if (hideVesselsAtPort && vessel.isAtPort) {
          return _features
        }
        if (
          hideNonSelectedVessels &&
          !vesselIsShowed(vessel.vesselProperties, vesselsTracksShowed, selectedVesselIdentity)
        ) {
          return _features
        }

        const feature = new Feature({
          geometry: new Point(vessel.coordinates),
        })
        feature.setId(`${Layers.VESSEL_BEACON_MALFUNCTION.code}:${getVesselId(vessel.vesselProperties)}`)
        _features.push(feature)

        return _features
      }, [])

      getVectorSource()?.clear(true)
      getVectorSource()?.addFeatures(features)
    }
  }, [
    adminRole,
    vessels,
    selectedVesselIdentity,
    vesselsTracksShowed,
    previewFilteredVesselsMode,
    nonFilteredVesselsAreHidden,
    hideNonSelectedVessels,
    hideVesselsAtPort,
  ])

  return null
}

export default React.memo(VesselAlertAndBeaconMalfunctionLayer)
