import { HIT_PIXEL_TO_TOLERANCE } from '@constants/constants'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { platformModifierKeyOnly } from 'ol/events/condition'
import OpenLayerMap from 'ol/Map'
import { Children, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { MapAttributionsBox } from './MapAttributionsBox'
import { MapCoordinatesBox } from './MapCoordinatesBox'
import { monitorfishMap } from '../monitorfishMap'
import { resetAnimateToRegulatoryLayer } from '../slice'
import { clickOnMapFeature } from '../useCases/clickOnMapFeature'
import { clickableLayerCodes, hoverableLayerCodes } from '../utils'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type { FeatureWithCodeAndEntityId } from '@libs/FeatureWithCodeAndEntityId'
import type { Coordinates } from '@mtes-mct/monitor-ui'
import type { MainAppThunk } from '@store'
import type { Feature, MapBrowserEvent } from 'ol'
import type { FeatureLike } from 'ol/Feature'
import type { AnimationOptions } from 'ol/View'
import type { PropsWithChildren } from 'react'

let lastEventForPointerMove
let timeoutForPointerMove
let timeoutForMove

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
  const isAnimating = useRef(false)
  const isInitRenderDone = useRef(false)
  const mapElement = useRef()

  const dispatch = useMainAppDispatch()
  const animateToRegulatoryLayer = useMainAppSelector(state => state.map.animateToRegulatoryLayer)

  const [cursorCoordinates, setCursorCoordinates] = useState<Coordinates | undefined>(undefined)

  const handleMapClick = useCallback(
    (event: MapBrowserEvent<any>, openLayerMap: OpenLayerMap) => {
      if (!event || !openLayerMap) {
        return
      }

      const feature = openLayerMap.forEachFeatureAtPixel<FeatureLike>(event.pixel, clickedFeature => clickedFeature, {
        hitTolerance: HIT_PIXEL_TO_TOLERANCE,
        layerFilter: layer =>
          !!clickableLayerCodes.find(clickableLayerName =>
            (layer as MonitorFishMap.VectorLayerWithName).name?.includes(clickableLayerName)
          )
      })
      const isCtrl = platformModifierKeyOnly(event)
      const mapClick = { ctrlKeyPressed: isCtrl, feature }
      dispatch(clickOnMapFeature(mapClick) as unknown as MainAppThunk)
    },
    [dispatch]
  )

  const handleBasePointerMove = useCallback(
    (event: MapBrowserEvent<any>, openLayerMap: OpenLayerMap) => {
      if (!event) {
        return
      }

      const pixel = openLayerMap.getEventPixel(event.originalEvent)
      const feature = openLayerMap.forEachFeatureAtPixel<FeatureLike>(pixel, hoveredFeature => hoveredFeature, {
        hitTolerance: HIT_PIXEL_TO_TOLERANCE,
        layerFilter: layer =>
          !!hoverableLayerCodes.find(hoverableLayerName =>
            (layer as MonitorFishMap.VectorLayerWithName).name?.includes(hoverableLayerName)
          )
      })

      if (handlePointerMove) {
        handlePointerMove(event)
      }

      if (!feature?.getId()) {
        if (setCurrentFeature) {
          setCurrentFeature(undefined)
        }
        // eslint-disable-next-line no-param-reassign
        ;(openLayerMap.getTarget() as HTMLElement).style.cursor = ''

        return
      }

      if (setCurrentFeature) {
        setCurrentFeature(feature as Feature | FeatureWithCodeAndEntityId | undefined)
      }
      // eslint-disable-next-line no-param-reassign
      ;(openLayerMap.getTarget() as HTMLElement).style.cursor = 'pointer'
    },
    [handlePointerMove, setCurrentFeature]
  )

  const throttleAndHandleMovingAndZoom = useCallback(
    (openLayerMap: OpenLayerMap) => {
      if (timeoutForMove) {
        return
      }

      timeoutForMove = setTimeout(() => {
        timeoutForMove = null
        if (handleMovingAndZoom) {
          handleMovingAndZoom(openLayerMap)
        }
      }, 100)
    },
    [handleMovingAndZoom]
  )

  const throttleAndHandlePointerMove = useCallback(
    (event: MapBrowserEvent<any>, openLayerMap: OpenLayerMap) => {
      if (event.dragging || timeoutForPointerMove) {
        if (timeoutForPointerMove) {
          lastEventForPointerMove = event
        }

        return
      }

      timeoutForPointerMove = setTimeout(() => {
        timeoutForPointerMove = null
        handleBasePointerMove(lastEventForPointerMove, openLayerMap)

        if (showCoordinates) {
          saveCoordinates(lastEventForPointerMove)
        }
      }, 50)
    },
    [handleBasePointerMove, showCoordinates]
  )

  useEffect(() => {
    monitorfishMap.setTarget(mapElement.current)

    monitorfishMap.on('click', event => handleMapClick(event, monitorfishMap))
    monitorfishMap.on('pointermove', event => throttleAndHandlePointerMove(event, monitorfishMap))
    monitorfishMap.on('movestart', () => throttleAndHandleMovingAndZoom(monitorfishMap))
    monitorfishMap.on('moveend', () => throttleAndHandleMovingAndZoom(monitorfishMap))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const animateToLayer = useCallback(
    _animateToRegulatoryLayer => {
      if (_animateToRegulatoryLayer && !isAnimating.current && isInitRenderDone.current) {
        if (_animateToRegulatoryLayer.extent) {
          monitorfishMap.getView().fit(_animateToRegulatoryLayer.extent, {
            callback: () => dispatch(resetAnimateToRegulatoryLayer()),
            duration: 1000
          })

          return
        }

        if (_animateToRegulatoryLayer.center) {
          const animateObject: AnimationOptions = {
            center: [_animateToRegulatoryLayer.center[0], _animateToRegulatoryLayer.center[1]],
            duration: 1000
          }

          const zoom = monitorfishMap.getView().getZoom()
          if (zoom && zoom < 8) {
            animateObject.zoom = 8
          }
          isAnimating.current = true
          monitorfishMap.getView().animate(animateObject, () => {
            isAnimating.current = false
            dispatch(resetAnimateToRegulatoryLayer())
          })
        }
      }
    },
    [dispatch]
  )

  useEffect(() => {
    animateToLayer(animateToRegulatoryLayer)
  }, [animateToRegulatoryLayer, animateToLayer])

  function saveCoordinates(event) {
    if (event) {
      const clickedCoordinates = monitorfishMap.getCoordinateFromPixel(event.pixel) as Coordinates
      if (!clickedCoordinates) {
        return
      }

      setCursorCoordinates(clickedCoordinates)
    }
  }

  return (
    <MapWrapper>
      <MapContainer
        // @ts-ignore
        ref={mapElement}
      />
      {showCoordinates && <MapCoordinatesBox coordinates={cursorCoordinates} />}
      {showAttributions && <MapAttributionsBox />}
      {Children.map(children, child => child)}
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
