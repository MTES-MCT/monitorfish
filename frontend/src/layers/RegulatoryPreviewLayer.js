import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import GeoJSON from 'ol/format/GeoJSON'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { OPENLAYERS_PROJECTION } from '../domain/entities/map'
import zoomInSubZone from '../domain/use_cases/zoomInSubZone'

const RegulatoryPreviewLayer = ({ map }) => {
  const dispatch = useDispatch()
  const { regulatoryGeometryToPreview } = useSelector(state => state.regulatory)
  const [vectorSource] = useState(new VectorSource({
    features: []
  }))
  const [layer] = useState(new Vector({
    renderBuffer: 4,
    className: Layers.REGULATORY_PREVIEW.code,
    source: vectorSource,
    updateWhileAnimating: true,
    updateWhileInteracting: true
  }))

  useEffect(() => {
    if (regulatoryGeometryToPreview && map) {
      vectorSource.clear()
      const feature = new GeoJSON({
        featureProjection: OPENLAYERS_PROJECTION
      }).readFeature(regulatoryGeometryToPreview)
      vectorSource.addFeature(feature)
      dispatch(zoomInSubZone({ feature }))
    }
  }, [map, regulatoryGeometryToPreview])

  useEffect(() => {
    addLayerToMap()
  }, [map])

  function addLayerToMap () {
    if (map) {
      map.getLayers().push(layer)
    }
  }

  return null
}

export default RegulatoryPreviewLayer
