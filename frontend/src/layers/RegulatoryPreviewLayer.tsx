import GeoJSON from 'ol/format/GeoJSON'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import React, { useCallback, useEffect, useRef } from 'react'

import { Layer } from '../domain/entities/layers/constants'
import { OPENLAYERS_PROJECTION } from '../domain/entities/map'
import zoomInLayer from '../domain/use_cases/layer/zoomInLayer'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { useAppSelector } from '../hooks/useAppSelector'
import { regulatoryPreviewStyle } from './styles/regulatoryPreview.style'

import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

export type RegulatoryPreviewLayerProps = {
  map?: any
}
function UnmemoizedRegulatoryPreviewLayer({ map }: RegulatoryPreviewLayerProps) {
  const dispatch = useAppDispatch()
  const { regulatoryGeometriesToPreview } = useAppSelector(state => state.regulatory)
  const vectorSourceRef = useRef<VectorSource | null>(null)
  const layerRef = useRef<Vector<VectorSource<Geometry>> | null>(null)

  function getVectorSource() {
    if (!vectorSourceRef.current) {
      vectorSourceRef.current = new VectorSource({
        features: []
      })
    }

    return vectorSourceRef.current
  }

  const getLayer = useCallback(() => {
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
  }, [])

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
          .filter((feature): feature is Feature<Geometry> => Boolean(feature))

        if (features?.length) {
          getVectorSource().addFeatures(features)
          dispatch(zoomInLayer({ feature: features[0] }) as any)
        }
      }
    }
  }, [dispatch, map, regulatoryGeometriesToPreview])

  useEffect(() => {
    if (map) {
      // TODO Check that: `Property 'name' does not exist on type 'VectorLayer<VectorSource<Geometry>>'`?
      ;(getLayer() as any).name = Layer.REGULATORY_PREVIEW.code
      map.getLayers().push(getLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(getLayer())
      }
    }
  }, [getLayer, map])

  return <></>
}

export const RegulatoryPreviewLayer = React.memo(UnmemoizedRegulatoryPreviewLayer)

RegulatoryPreviewLayer.displayName = 'RegulatoryPreviewLayer'
