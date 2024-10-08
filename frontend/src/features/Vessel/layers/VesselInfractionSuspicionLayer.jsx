import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'
import { LayerProperties } from '../../../domain/entities/layers/constants'

import { getVesselInfractionSuspicionStyle } from './style'
import {
  getVesselCompositeIdentifier,
  getVesselLastPositionVisibilityDates,
  Vessel,
  vesselIsShowed
} from '../../../domain/entities/vessel/vessel'
import { useIsSuperUser } from '../../../auth/hooks/useIsSuperUser'
import { monitorfishMap } from '../../map/monitorfishMap'
import { vesselSelectors } from '../slice'

const VesselInfractionSuspicionLayer = () => {
  const isSuperUser = useIsSuperUser()
  const hideNonSelectedVessels = useSelector(state => state.vessel.hideNonSelectedVessels)
  const vesselsTracksShowed = useSelector(state => state.vessel.vesselsTracksShowed)
  const selectedVesselIdentity = useSelector(state => state.vessel.selectedVesselIdentity)
  const vessels = useSelector(state => vesselSelectors.selectAll(state.vessel.vessels))
  const nonFilteredVesselsAreHidden = useSelector(state => state.filter.nonFilteredVesselsAreHidden)
  const previewFilteredVesselsMode = useSelector(state => state.global.previewFilteredVesselsMode)
  const hideVesselsAtPort = useSelector(state => state.map.hideVesselsAtPort)
  const vesselsLastPositionVisibility = useSelector(state => state.map.vesselsLastPositionVisibility)

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
        zIndex: LayerProperties.VESSEL_INFRACTION_SUSPICION.zIndex,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        style: (_, resolution) => getVesselInfractionSuspicionStyle(resolution)
      })
    }
    return layerRef.current
  }

  useEffect(() => {
    if (isSuperUser) {
      getLayer().name = LayerProperties.VESSEL_INFRACTION_SUSPICION.code
      monitorfishMap.getLayers().push(getLayer())
    }

    return () => {
      monitorfishMap.removeLayer(getLayer())
    }
  }, [isSuperUser])

  useEffect(() => {
    if (isSuperUser && vessels?.length) {
      const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

      const features = vessels.reduce((features, vessel) => {
        if (!vessel.hasInfractionSuspicion) return features
        if (nonFilteredVesselsAreHidden && !vessel.isFiltered) return features
        if (previewFilteredVesselsMode && !vessel.filterPreview) return features
        if (hideVesselsAtPort && vessel.isAtPort) return features
        if (hideNonSelectedVessels && !vesselIsShowed(vessel, vesselsTracksShowed, selectedVesselIdentity)) return features
        if (!Vessel.getVesselOpacity(vessel.dateTime, vesselIsHidden, vesselIsOpacityReduced)) return features

        const feature = new Feature({
          geometry: new Point(vessel.coordinates)
        })
        feature.setId(`${LayerProperties.VESSEL_INFRACTION_SUSPICION.code}:${getVesselCompositeIdentifier(vessel)}`)
        features.push(feature)

        return features
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
    hideVesselsAtPort,
    vesselsLastPositionVisibility?.opacityReduced,
    vesselsLastPositionVisibility?.hidden
  ])

  return null
}

export default React.memo(VesselInfractionSuspicionLayer)
