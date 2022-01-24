import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'
import Layers from '../domain/entities/layers'

import { getVesselAlertStyle } from './styles/vessel.style'
import { getVesselFeatureIdFromVessel } from '../domain/entities/vessel'

const VesselAlertLayer = ({ map }) => {
  const { vessels } = useSelector(state => state.vessel)

  const vectorSourceRef = useRef(new VectorSource({
    features: []
  }))
  const layerRef = useRef(new Vector({
    renderBuffer: 4,
    source: vectorSourceRef.current,
    zIndex: Layers.VESSEL_ALERT.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: (feature, resolution) => getVesselAlertStyle(feature, resolution)
  }))

  useEffect(() => {
    if (map) {
      layerRef.current.name = Layers.VESSEL_ALERT.code
      map.getLayers().push(layerRef.current)
    }

    return () => {
      if (map) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map])

  useEffect(() => {
    if (map) {
      const features = vessels
        .filter(vessel => vessel.vesselProperties.hasAlert)
        .map(vessel => {
          const feature = new Feature({
            geometry: new Point(vessel.coordinates)
          })
          feature.setId(`${Layers.VESSEL_ALERT.code}:${getVesselFeatureIdFromVessel(vessel.vesselProperties)}`)

          return feature
        })

      vectorSourceRef.current?.clear(true)
      vectorSourceRef.current?.addFeatures(features)
    }
  }, [map, vessels])

  return null
}

export default VesselAlertLayer
