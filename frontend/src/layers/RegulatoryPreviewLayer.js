import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import GeoJSON from 'ol/format/GeoJSON'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { OPENLAYERS_PROJECTION } from '../domain/entities/map'
import zoomInLayer from '../domain/use_cases/zoomInLayer'
import { regulatoryPreviewStyle } from './styles/regulatoryPreview.style'

const RegulatoryPreviewLayer = ({ map }) => {
  const dispatch = useDispatch()
  const { regulatoryGeometryToPreview } = useSelector(state => state.regulatory)
  const [vectorSource] = useState(new VectorSource({
    features: []
  }))
  const [layer] = useState(new Vector({
    renderBuffer: 4,
    source: vectorSource,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: regulatoryPreviewStyle
  }))

  useEffect(() => {
    if (regulatoryGeometryToPreview && map) {
      vectorSource.clear()
      const feature = new GeoJSON({
        featureProjection: OPENLAYERS_PROJECTION
      }).readFeature(regulatoryGeometryToPreview)
      vectorSource.addFeature(feature)
      dispatch(zoomInLayer({ feature }))
    }
  }, [map, regulatoryGeometryToPreview])

  useEffect(() => {
    function addLayerToMap () {
      if (map) {
        layer.name = Layers.REGULATORY_PREVIEW.code
        map.getLayers().push(layer)
      }

      return () => {
        if (map) {
          map.removeLayer(layer)
        }
      }
    }

    addLayerToMap()
  }, [map])

  return null
}

export default RegulatoryPreviewLayer
