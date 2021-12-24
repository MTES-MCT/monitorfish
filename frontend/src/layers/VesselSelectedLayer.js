import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'

import Layers from '../domain/entities/layers'
import { Vessel } from '../domain/entities/vessel'

import { getSelectedVesselStyle } from './styles/vessel.style'

export const OPACITY = 'opacity'

const VesselSelectedLayer = ({ map }) => {
  const {
    selectedVessel
  } = useSelector(state => state.vessel)

  const {
    selectedBaseLayer
  } = useSelector(state => state.map)

  const vectorSourceRef = useRef(new VectorSource({
    features: []
  }))
  const isLight = Vessel.iconIsLight(selectedBaseLayer)
  const style = getSelectedVesselStyle({ isLight })
  const layerRef = useRef(new Vector({
    renderBuffer: 4,
    source: vectorSourceRef.current,
    zIndex: Layers.SELECTED_VESSEL.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style
  }))

  useEffect(() => {
    layerRef.current?.setStyle(getSelectedVesselStyle({ isLight }))
  }, [isLight])

  useEffect(() => {
    if (map) {
      layerRef.current.name = 'SelectedVessels'
      map.getLayers().push(layerRef.current)
    }

    return () => {
      if (map) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map])

  useEffect(() => {
    if (map && selectedVessel) {
      const feature = new Feature({
        ...selectedVessel,
        geometry: new Point(selectedVessel.coordinates)
      })
      vectorSourceRef.current?.clear(true)
      vectorSourceRef.current?.addFeature(feature)
    }
  }, [selectedVessel])

  return null
}

export default VesselSelectedLayer
