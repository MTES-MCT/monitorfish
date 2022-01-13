import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector } from 'ol/layer'
import { transform } from 'ol/proj'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import Layers from '../domain/entities/layers'
import { Vessel } from '../domain/entities/vessel'

import { getSelectedVesselStyle } from './styles/vessel.style'

const VesselSelectedLayer = ({ map }) => {
  const { selectedVessel, vesselsTracksShowed } = useSelector(state => state.vessel)
  const { selectedBaseLayer } = useSelector(state => state.map)

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
      layerRef.current.name = Layers.SELECTED_VESSEL.code
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
      vectorSourceRef.current?.clear(true)
      if (selectedVessel) {
        const coordinates = transform([selectedVessel.longitude, selectedVessel.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
        const feature = new Feature({
          ...selectedVessel,
          geometry: new Point(coordinates)
        })
        vectorSourceRef.current?.addFeature(feature)
      }
      if (vesselsTracksShowed) {
        const vessels = Object.values(vesselsTracksShowed)
        const features = vessels?.map(vessel => {
          const f = new Feature({
            course: vessel.course,
            geometry: new Point(vessel.coordinates)
          })
          f.setId(vessel.vesselId)
          return f
        })
        vectorSourceRef.current?.addFeatures(features)
      }
    }
  }, [map, selectedVessel, vesselsTracksShowed])

  return null
}

export default VesselSelectedLayer
