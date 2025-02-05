import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { getVesselAlertAndBeaconMalfunctionStyle } from './style'
import { useIsSuperUser } from '../../../auth/hooks/useIsSuperUser'
import { vesselIsShowed } from '../../../domain/entities/vessel/vessel'
import { LayerProperties } from '../../Map/constants'
import { monitorfishMap } from '../../Map/monitorfishMap'
import { vesselSelectors } from '../slice'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'

function VesselAlertAndBeaconMalfunctionLayer() {
  const isSuperUser = useIsSuperUser()
  const { hideNonSelectedVessels, selectedVesselIdentity, vesselsTracksShowed } = useSelector(state => state.vessel)
  const vessels = useSelector(state => vesselSelectors.selectAll(state.vessel.vessels))

  const { nonFilteredVesselsAreHidden } = useSelector(state => state.filter)

  const { previewFilteredVesselsMode } = useSelector(state => state.global)

  const { hideVesselsAtPort } = useSelector(state => state.map)

  const vectorSourceRef = useRef(null)
  function getVectorSource() {
    if (vectorSourceRef.current === null) {
      vectorSourceRef.current = new VectorSource({
        features: [],
        wrapX: false
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
        zIndex: LayerProperties.VESSEL_BEACON_MALFUNCTION.zIndex
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
        if (!vessel.hasBeaconMalfunction) {
          return _features
        }
        if (!vessel.hasAlert) {
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
        if (hideNonSelectedVessels && !vesselIsShowed(vessel, vesselsTracksShowed, selectedVesselIdentity)) {
          return _features
        }

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

export default React.memo(VesselAlertAndBeaconMalfunctionLayer)
