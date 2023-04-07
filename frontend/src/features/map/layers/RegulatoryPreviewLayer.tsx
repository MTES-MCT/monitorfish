import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { memo, useCallback, useEffect, useRef } from 'react'

import { getRegulatoryLayerStyle } from './styles/regulatoryLayer.style'
import { getFeaturesFromRegulatoryZones } from './utils'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import zoomInLayer from '../../../domain/use_cases/layer/zoomInLayer'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'

import type { VectorLayerWithName } from '../../../domain/types/layer'
import type { BaseRegulatoryZone } from '../../../domain/types/regulation'
import type { Feature } from 'ol'
import type { MutableRefObject } from 'react'

export type RegulatoryPreviewLayerProps = {
  map?: any
}
function UnmemoizedRegulatoryPreviewLayer({ map }: RegulatoryPreviewLayerProps) {
  const dispatch = useMainAppDispatch()
  const { regulatoryZonesToPreview } = useMainAppSelector(state => state.regulatory)
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
        style: feature => [getRegulatoryLayerStyle(feature as Feature, feature.getProperties() as BaseRegulatoryZone)],
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

    const features = getFeaturesFromRegulatoryZones(regulatoryZonesToPreview)
    if (!features?.length) {
      return
    }

    getVectorSource().addFeatures(features)
    dispatch(zoomInLayer({ feature: features[0] }))
  }, [dispatch, map, regulatoryZonesToPreview])

  useEffect(() => {
    if (!map) {
      return undefined
    }

    getLayer().name = LayerProperties.REGULATORY_PREVIEW.code
    map.getLayers().push(getLayer())

    return () => {
      map.removeLayer(getLayer())
    }
  }, [getLayer, map])

  return <></>
}

export const RegulatoryPreviewLayer = memo(UnmemoizedRegulatoryPreviewLayer)

RegulatoryPreviewLayer.displayName = 'RegulatoryPreviewLayer'
