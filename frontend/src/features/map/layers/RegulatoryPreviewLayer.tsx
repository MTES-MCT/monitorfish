import GeoJSON from 'ol/format/GeoJSON'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import React, { MutableRefObject, useCallback, useEffect, useRef } from 'react'

import { Layer } from '../../../domain/entities/layers/constants'
import { OPENLAYERS_PROJECTION } from '../../../domain/entities/map/constants'
import zoomInLayer from '../../../domain/use_cases/layer/zoomInLayer'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { regulatoryPreviewStyle } from './styles/regulatoryPreview.style'

import type { VectorLayerWithName } from '../../../domain/types/layer'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

export type RegulatoryPreviewLayerProps = {
  map?: any
}
function UnmemoizedRegulatoryPreviewLayer({ map }: RegulatoryPreviewLayerProps) {
  const dispatch = useMainAppDispatch()
  const { regulatoryGeometriesToPreview } = useMainAppSelector(state => state.regulatory)
  const vectorSourceRef = useRef() as MutableRefObject<VectorSource>
  const layerRef = useRef() as MutableRefObject<VectorLayerWithName>

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
    if (!map) {
      return
    }

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
        dispatch(zoomInLayer({ feature: features[0] }))
      }
    }
  }, [dispatch, map, regulatoryGeometriesToPreview])

  useEffect(() => {
    if (!map) {
      return undefined
    }

    getLayer().name = Layer.REGULATORY_PREVIEW.code
    map.getLayers().push(getLayer())

    return () => {
      map.removeLayer(getLayer())
    }
  }, [getLayer, map])

  return <></>
}

export const RegulatoryPreviewLayer = React.memo(UnmemoizedRegulatoryPreviewLayer)

RegulatoryPreviewLayer.displayName = 'RegulatoryPreviewLayer'
