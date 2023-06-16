import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import { transform } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import React, { useCallback, useEffect, useRef } from 'react'

import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../../../domain/entities/layers/types'
import type { VesselLastPositionFeature } from '../../../../domain/entities/vessel/types'
import type { VectorLayerWithName } from '../../../../domain/types/layer'
import { useGeoLocation } from '../hooks/useGeoLocation'
import { pointLayerStyle } from '../styles/dottedLayer.style'

export type GeoLocationLayerProps = {
  map?: any
}
function UnmemoizedGeoLocationLayer({ map }: GeoLocationLayerProps) {
  const { coordinates } = useGeoLocation()

  const vectorSourceRef = useRef<VectorSource>()
  const getVectorSource = useCallback(() => {
    if (vectorSourceRef.current === undefined) {
      vectorSourceRef.current = new VectorSource()
    }

    return vectorSourceRef.current as VectorSource
  }, [])

  const vectorLayerRef = useRef<VectorLayerWithName>()
  const getVectorLayer = useCallback(() => {
    if (vectorLayerRef.current === undefined) {
      vectorLayerRef.current = new VectorLayer({
        className: MonitorFishLayer.GEOLOCATION,
        renderBuffer: 7,
        source: getVectorSource(),
        style: pointLayerStyle,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: LayerProperties.MISSION_HOVER.zIndex
      })
    }

    return vectorLayerRef.current as VectorLayerWithName
  }, [getVectorSource])

  useEffect(() => {
    if (map) {
      getVectorLayer().name = MonitorFishLayer.MISSION_HOVER
      map.getLayers().push(getVectorLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(getVectorLayer())
      }
    }
  }, [map, getVectorLayer])

  useEffect(() => {
    if (!coordinates || !map) {
      return
    }

    const transformedCoordinates = transform(
      [coordinates.longitude, coordinates.latitude],
      WSG84_PROJECTION,
      OPENLAYERS_PROJECTION
    )
    const feature = new Feature({
      geometry: new Point(transformedCoordinates)
    }) as VesselLastPositionFeature

    getVectorSource()?.addFeature(feature)
  }, [map, getVectorSource, coordinates])

  return <></>
}

export const GeoLocationLayer = React.memo(UnmemoizedGeoLocationLayer)

GeoLocationLayer.displayName = 'GeoLocationLayer'
