import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'
import Layers from '../domain/entities/layers'

import { getVesselAlertAndBeaconStatusStyle } from './styles/vessel.style'
import { getVesselFeatureIdFromVessel, vesselsAreEquals } from '../domain/entities/vessel'

const VesselAlertAndBeaconStatusLayer = ({ map }) => {
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
    hideVesselsAtPort
  } = useSelector(state => state.map)

  const vectorSourceRef = useRef(null)
  const layerRef = useRef(null)

  function getVectorSource () {
    if (vectorSourceRef.current === null) {
      vectorSourceRef.current = new VectorSource({
        features: []
      })
    }
    return vectorSourceRef.current
  }

  function getLayer () {
    if (layerRef.current === null) {
      layerRef.current = new Vector({
        source: getVectorSource(),
        zIndex: Layers.VESSEL_BEACON_STATUS.zIndex,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        style: (feature, resolution) => getVesselAlertAndBeaconStatusStyle(feature, resolution)
      })
    }
    return layerRef.current
  }

  useEffect(() => {
    if (map) {
      getLayer().name = Layers.VESSEL_BEACON_STATUS.code
      map.getLayers().push(getLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(getLayer())
      }
    }
  }, [map])

  useEffect(() => {
    if (vessels?.length) {
      const features = vessels.reduce((features, vessel) => {
        if (!vessel.hasBeaconStatus) return features
        if (!vessel.vesselProperties.hasAlert) return features
        if (nonFilteredVesselsAreHidden && !vessel.isFiltered) return features
        if (previewFilteredVesselsMode && !vessel.filterPreview) return features
        if (hideVesselsAtPort && vessel.isAtPort) return features
        if (hideNonSelectedVessels && !vesselsAreEquals(vessel.vesselProperties, selectedVessel)) return features

        const feature = new Feature({
          geometry: new Point(vessel.coordinates)
        })
        feature.setId(`${Layers.VESSEL_BEACON_STATUS.code}:${getVesselFeatureIdFromVessel(vessel.vesselProperties)}`)
        features.push(feature)

        return features
      }, [])

      getVectorSource()?.clear(true)
      getVectorSource()?.addFeatures(features)
    }
  }, [
    vessels,
    selectedVessel,
    previewFilteredVesselsMode,
    nonFilteredVesselsAreHidden,
    hideNonSelectedVessels,
    hideVesselsAtPort
  ])

  return null
}

export default VesselAlertAndBeaconStatusLayer
