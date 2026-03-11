import OpenLayerMap from 'ol/Map'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useThrottledCallback } from 'use-debounce'

import { MapAttributionsBox } from './MapAttributionsBox'
import { MapCoordinatesBox } from './MapCoordinatesBox'
import { useMapAnimation } from '../hooks/useMapAnimation'
import { useMapClick } from '../hooks/useMapClick'
import { useMapMount } from '../hooks/useMapMount'
import { useMapPointerMove } from '../hooks/useMapPointerMove'
import { monitorfishMap } from '../monitorfishMap'

import type { FeatureWithCodeAndEntityId } from '@libs/FeatureWithCodeAndEntityId'
import type { Coordinates } from '@mtes-mct/monitor-ui'
import type { Feature, MapBrowserEvent } from 'ol'
import type { PropsWithChildren } from 'react'

/**
 * BaseMap forwards map as props to children
 */
type BaseMapProps = {
  handleMovingAndZoom?: (openLayerMap: OpenLayerMap) => void
  handlePointerMove?: (event: MapBrowserEvent<any>) => void
  isMainApp?: boolean
  setCurrentFeature?: (feature: Feature | FeatureWithCodeAndEntityId | undefined) => void
  showAttributions?: boolean
  showCoordinates?: boolean
} & PropsWithChildren

export function BaseMap({
  children,
  handleMovingAndZoom,
  handlePointerMove,
  isMainApp,
  setCurrentFeature,
  showAttributions,
  showCoordinates
}: BaseMapProps) {
  const isInitRenderDone = useRef(false)
  const mapElement = useRef<HTMLElement | undefined>()

  const [cursorCoordinates, setCursorCoordinates] = useState<Coordinates | undefined>(undefined)

  useEffect(() => {
    if (!isMainApp) {
      isInitRenderDone.current = true

      return
    }

    // Wait 15 seconds to not apply any animate() before this init phase only in the homepage
    setTimeout(() => {
      isInitRenderDone.current = true
    }, 15000)
  }, [isMainApp])

  const saveCoordinates = useCallback((event: MapBrowserEvent<any>) => {
    if (event) {
      const clickedCoordinates = monitorfishMap.getCoordinateFromPixel(event.pixel) as Coordinates
      if (!clickedCoordinates) {
        return
      }

      setCursorCoordinates(clickedCoordinates)
    }
  }, [])

  const throttleAndHandleMovingAndZoom = useThrottledCallback(
    (openLayerMap: OpenLayerMap) => handleMovingAndZoom?.(openLayerMap),
    100
  )

  useMapMount(monitorfishMap, mapElement)
  useMapClick(monitorfishMap)
  useMapPointerMove(monitorfishMap, handlePointerMove, setCurrentFeature, showCoordinates ? saveCoordinates : undefined)
  useMapAnimation(isInitRenderDone)

  useEffect(() => {
    const onMoveStart = () => throttleAndHandleMovingAndZoom(monitorfishMap)
    const onMoveEnd = () => throttleAndHandleMovingAndZoom(monitorfishMap)
    const onLoadEnd = () => throttleAndHandleMovingAndZoom(monitorfishMap)

    monitorfishMap.on('movestart', onMoveStart)
    monitorfishMap.on('moveend', onMoveEnd)
    monitorfishMap.on('loadend', onLoadEnd)

    return () => {
      monitorfishMap.un('movestart', onMoveStart)
      monitorfishMap.un('moveend', onMoveEnd)
      monitorfishMap.un('loadend', onLoadEnd)
    }
  }, [throttleAndHandleMovingAndZoom])

  return (
    <MapWrapper>
      <MapContainer
        // @ts-ignore
        ref={mapElement}
      />
      {showCoordinates && <MapCoordinatesBox coordinates={cursorCoordinates} />}
      {showAttributions && <MapAttributionsBox />}
      {children}
    </MapWrapper>
  )
}

const MapWrapper = styled.div`
  display: flex;
  flex: 1;
`

const MapContainer = styled.div`
  height: 100vh;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
`
