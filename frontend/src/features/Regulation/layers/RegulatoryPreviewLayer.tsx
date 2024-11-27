import { useHybridAppDispatch } from '@hooks/useHybridAppDispatch'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { memo, useCallback, useEffect, useRef } from 'react'

import { getRegulatoryLayerStyle } from './styles/regulatoryLayer.style'
import { zoomInLayer } from '../../LayersSidebar/useCases/zoomInLayer'
import { LayerProperties } from '../../MainMap/constants'
import { getFeaturesFromRegulatoryZones } from '../../map/layers/utils'
import { monitorfishMap } from '../../map/monitorfishMap'

import type { BaseRegulatoryZone, RegulatoryZone } from '../types'
import type { MainMap } from '@features/MainMap/MainMap.types'
import type { ZoneSelected } from '@features/VesselFilter/types'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'
import type { MutableRefObject } from 'react'
import type { UnknownAction } from 'redux'

type RegulatoryPreviewLayerProps = Readonly<{
  regulatoryZonesToPreview: Array<Partial<RegulatoryZone>>
  zoneSelected?: ZoneSelected | undefined
}>
function UnmemoizedRegulatoryPreviewLayer({ regulatoryZonesToPreview, zoneSelected }: RegulatoryPreviewLayerProps) {
  const vectorSourceRef = useRef() as MutableRefObject<VectorSource>
  const layerRef = useRef() as MutableRefObject<MainMap.VectorLayerWithName>

  const dispatch = useHybridAppDispatch()

  function getVectorSource() {
    if (!vectorSourceRef.current) {
      vectorSourceRef.current = new VectorSource<Feature<Geometry>>({
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
        style: feature => [getRegulatoryLayerStyle(feature, feature.getProperties() as BaseRegulatoryZone)],
        updateWhileAnimating: true,
        updateWhileInteracting: true
      })
    }

    return layerRef.current
  }, [])

  useEffect(() => {
    getVectorSource().clear()

    const features = getFeaturesFromRegulatoryZones(regulatoryZonesToPreview)
    if (!features?.length) {
      return
    }

    getVectorSource().addFeatures(features)

    // Do not zoom on regulation when a specific zone was drawed to search regulations
    if (!zoneSelected) {
      dispatch(zoomInLayer<any>({ feature: features[0] }) as unknown as UnknownAction)
    }
  }, [dispatch, zoneSelected, regulatoryZonesToPreview])

  useEffect(() => {
    getLayer().name = LayerProperties.REGULATORY_PREVIEW.code
    monitorfishMap.getLayers().push(getLayer())

    return () => {
      monitorfishMap.removeLayer(getLayer())
    }
  }, [getLayer])

  return <></>
}

export const RegulatoryPreviewLayer = memo(UnmemoizedRegulatoryPreviewLayer)

RegulatoryPreviewLayer.displayName = 'RegulatoryPreviewLayer'
