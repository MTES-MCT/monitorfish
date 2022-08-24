import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import Layers from '../domain/entities/layers'
import { getVesselId, getVesselLastPositionVisibilityDates, Vessel, vesselIsShowed } from '../domain/entities/vessel'
import { getVesselInfractionSuspicionStyle } from './styles/vessel.style'

function VesselInfractionSuspicionLayer({ map }) {
  const { hideNonSelectedVessels, selectedVesselIdentity, vessels, vesselsTracksShowed } = useSelector(
    state => state.vessel,
  )

  const { nonFilteredVesselsAreHidden } = useSelector(state => state.filter)

  const { adminRole, previewFilteredVesselsMode } = useSelector(state => state.global)

  const { hideVesselsAtPort, vesselsLastPositionVisibility } = useSelector(state => state.map)

  const vectorSourceRef = useRef(null)
  const layerRef = useRef(null)

  function getVectorSource() {
    if (vectorSourceRef.current === null) {
      vectorSourceRef.current = new VectorSource({
        features: [],
        wrapX: false,
      })
    }

    return vectorSourceRef.current
  }

  function getLayer() {
    if (layerRef.current === null) {
      layerRef.current = new Vector({
        source: getVectorSource(),
        style: (feature, resolution) => getVesselInfractionSuspicionStyle(feature, resolution),
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: Layers.VESSEL_INFRACTION_SUSPICION.zIndex,
      })
    }

    return layerRef.current
  }

  useEffect(() => {
    if (adminRole && map) {
      getLayer().name = Layers.VESSEL_INFRACTION_SUSPICION.code
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
      const { vesselIsHidden, vesselIsOpacityReduced } =
        getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

      const features = vessels.reduce((features, vessel) => {
        if (!vessel.vesselProperties.hasInfractionSuspicion) {
          return features
        }
        if (nonFilteredVesselsAreHidden && !vessel.isFiltered) {
          return features
        }
        if (previewFilteredVesselsMode && !vessel.filterPreview) {
          return features
        }
        if (hideVesselsAtPort && vessel.isAtPort) {
          return features
        }
        if (
          hideNonSelectedVessels &&
          !vesselIsShowed(vessel.vesselProperties, vesselsTracksShowed, selectedVesselIdentity)
        ) {
          return features
        }
        if (!Vessel.getVesselOpacity(vessel.vesselProperties.dateTime, vesselIsHidden, vesselIsOpacityReduced)) {
          return features
        }

        const feature = new Feature({
          geometry: new Point(vessel.coordinates),
        })
        feature.setId(`${Layers.VESSEL_INFRACTION_SUSPICION.code}:${getVesselId(vessel.vesselProperties)}`)
        features.push(feature)

        return features
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
    vesselsLastPositionVisibility?.opacityReduced,
    vesselsLastPositionVisibility?.hidden,
  ])

  return null
}

export default React.memo(VesselInfractionSuspicionLayer)
