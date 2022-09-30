import GeoJSON from 'ol/format/GeoJSON'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Layers from '../domain/entities/layers'
import { OPENLAYERS_PROJECTION } from '../domain/entities/map'
import zoomInLayer from '../domain/use_cases/layer/zoomInLayer'
import { regulatoryPreviewStyle } from './styles/regulatoryPreview.style'

function RegulatoryPreviewLayer({ map }) {
  const dispatch = useDispatch()
  const { regulatoryGeometriesToPreview } = useSelector(state => state.regulatory)
  const vectorSourceRef = useRef(null)
  function getVectorSource() {
    if (!vectorSourceRef.current) {
      vectorSourceRef.current = new VectorSource({
        features: []
      })
    }

    return vectorSourceRef.current
  }
  const layerRef = useRef(null)
  function getLayer() {
    if (!layerRef.current) {
      layerRef.current = new Vector({
        renderBuffer: 4,
        source: getVectorSource(),
        style: regulatoryPreviewStyle,
        updateWhileAnimating: true,
        updateWhileInteracting: true
      })
    }

    return layerRef.current
  }

  useEffect(() => {
    if (map) {
      getVectorSource().clear()

      if (regulatoryGeometriesToPreview && regulatoryGeometriesToPreview.length) {
        const features = regulatoryGeometriesToPreview
          .map(geometry => {
            if (geometry) {
              return new GeoJSON({
                featureProjection: OPENLAYERS_PROJECTION
              }).readFeature(geometry)
            }

            return null
          })
          .filter(feature => feature)

        if (features?.length) {
          getVectorSource().addFeatures(features)
          dispatch(zoomInLayer({ feature: features[0] }))
        }
      }
    }
  }, [map, regulatoryGeometriesToPreview])

  useEffect(() => {
    if (map) {
      getLayer().name = Layers.REGULATORY_PREVIEW.code
      map.getLayers().push(getLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(getLayer())
      }
    }
  }, [map])

  return null
}

export default React.memo(RegulatoryPreviewLayer)
