import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { MutableRefObject, useCallback, useEffect, useRef } from 'react'

import { dottedLayerStyle } from './styles/dottedLayer.style'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../domain/entities/map/constants'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'

import type { VectorLayerWithName } from '../../../domain/types/layer'
import type { Feature } from 'ol'
import type Geometry from 'ol/geom/Geometry'

export function RegulatoryLayerSearch({ map }) {
  const { zoneSelected } = useMainAppSelector(state => state.regulatoryLayerSearch)

  const vectorSourceRef = useRef() as MutableRefObject<VectorSource<Geometry>>
  const getVectorSource = useCallback(() => {
    if (vectorSourceRef.current === undefined) {
      vectorSourceRef.current = new VectorSource({
        format: new GeoJSON({
          dataProjection: WSG84_PROJECTION,
          featureProjection: OPENLAYERS_PROJECTION
        })
      })
    }

    return vectorSourceRef.current
  }, [])

  const vectorLayerRef = useRef() as MutableRefObject<VectorLayerWithName>

  useEffect(() => {
    function getVectorLayer() {
      if (vectorLayerRef.current === undefined) {
        vectorLayerRef.current = new VectorLayer({
          renderBuffer: 7,
          source: getVectorSource(),
          style: [dottedLayerStyle],
          updateWhileAnimating: true,
          updateWhileInteracting: true,
          zIndex: LayerProperties.DRAW.zIndex
        })
        vectorLayerRef.current.name = LayerProperties.DRAW.code
      }

      return vectorLayerRef.current
    }

    if (map) {
      map.getLayers().push(getVectorLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(getVectorLayer())
      }
    }
  }, [map, getVectorSource])

  useEffect(() => {
    if (!getVectorSource()) {
      return
    }

    if (!zoneSelected?.feature) {
      getVectorSource().clear(true)

      return
    }

    const features = getVectorSource().getFormat()?.readFeatures(zoneSelected?.feature)
    if (!features) {
      return
    }

    getVectorSource().clear(true)
    getVectorSource().addFeatures(features as Feature<Geometry>[])
  }, [zoneSelected, getVectorSource])

  return null
}
