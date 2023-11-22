import { platformModifierKeyOnly } from 'ol/events/condition'
import OpenLayerMap from 'ol/Map'
import { Children, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { MapAttributionsBox } from './controls/MapAttributionsBox'
import { MapCoordinatesBox } from './controls/MapCoordinatesBox'
import { monitorfishMap } from './monitorfishMap'
import { HIT_PIXEL_TO_TOLERANCE } from '../../constants/constants'
import { clickableLayerCodes, hoverableLayerCodes } from '../../domain/entities/layers'
import { resetAnimateToRegulatoryLayer } from '../../domain/shared_slices/Map'
import { clickOnMapFeature } from '../../domain/use_cases/map/clickOnMapFeature'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

import type { VectorLayerWithName } from '../../domain/types/layer'
import type { Coordinates } from '@mtes-mct/monitor-ui'
import type { FeatureLike } from 'ol/Feature'
import type { AnimationOptions } from 'ol/View'
import type { HTMLProps, PropsWithChildren } from 'react'

let lastEventForPointerMove
let timeoutForPointerMove
let timeoutForMove

/**
 * BaseMap forwards map as props to children
 */
type BaseMapProps = {
  handleMovingAndZoom?: (map) => void
  handlePointerMove?: (feature) => void
  isMainApp?: boolean
  setCurrentFeature?: (feature) => void
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
  const { animateToRegulatoryLayer } = useMainAppSelector(state => state.map)

  const { healthcheckTextWarning, previewFilteredVesselsMode } = useMainAppSelector(state => state.global)
  const dispatch = useMainAppDispatch()

  const isAnimating = useRef(false)
  const isInitRenderDone = useRef(false)
  const [cursorCoordinates, setCursorCoordinates] = useState<Coordinates | undefined>(undefined)

  const mapElement = useRef()

  const handleMapClick = useCallback(
    (event, _map: OpenLayerMap) => {
      if (!event || !_map) {
        return
      }

      const feature = _map.forEachFeatureAtPixel<FeatureLike>(event.pixel, clickedFeature => clickedFeature, {
        hitTolerance: HIT_PIXEL_TO_TOLERANCE,
        layerFilter: layer =>
          !!clickableLayerCodes.find(
            clickableLayerName => (layer as VectorLayerWithName).name?.includes(clickableLayerName)
          )
      })
      const isCtrl = platformModifierKeyOnly(event)
      const mapClick = { ctrlKeyPressed: isCtrl, feature }
      dispatch(clickOnMapFeature(mapClick))
    },
    [dispatch]
  )

  const handleBasePointerMove = useCallback(
    (event, _map: OpenLayerMap) => {
      if (!event || !_map) {
        return
      }

      const pixel = _map.getEventPixel(event.originalEvent)
      const feature = _map.forEachFeatureAtPixel<FeatureLike>(pixel, hoveredFeature => hoveredFeature, {
        hitTolerance: HIT_PIXEL_TO_TOLERANCE,
        layerFilter: layer =>
          !!hoverableLayerCodes.find(
            hoverableLayerName => (layer as VectorLayerWithName).name?.includes(hoverableLayerName)
          )
      })

      if (handlePointerMove) {
        handlePointerMove(event)
      }

      if (!feature?.getId()) {
        if (setCurrentFeature) {
          setCurrentFeature(null)
        }
        // eslint-disable-next-line no-param-reassign
        ;(_map.getTarget() as HTMLElement).style.cursor = ''

        return
      }

      if (setCurrentFeature) {
        setCurrentFeature(feature)
      }
      // eslint-disable-next-line no-param-reassign
      ;(_map.getTarget() as HTMLElement).style.cursor = 'pointer'
    },
    [handlePointerMove, setCurrentFeature]
  )

  const throttleAndHandleMovingAndZoom = useCallback(
    _map => {
      if (timeoutForMove) {
        return
      }

      timeoutForMove = setTimeout(() => {
        timeoutForMove = null
        if (handleMovingAndZoom) {
          handleMovingAndZoom(_map)
        }
      }, 100)
    },
    [handleMovingAndZoom]
  )

  const throttleAndHandlePointerMove = useCallback(
    (event, _map) => {
      if (event.dragging || timeoutForPointerMove) {
        if (timeoutForPointerMove) {
          lastEventForPointerMove = event
        }

        return
      }

      timeoutForPointerMove = setTimeout(() => {
        timeoutForPointerMove = null
        handleBasePointerMove(lastEventForPointerMove, _map)

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
        hasHealthcheckTextWarning={!!healthcheckTextWarning.length}
        isPreviewFilteredVesselsMode={!!previewFilteredVesselsMode}
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

const MapContainer = styled.div<
  {
    hasHealthcheckTextWarning: boolean
    isPreviewFilteredVesselsMode: boolean
  } & HTMLProps<HTMLDivElement>
>`
  height: ${p => (p.hasHealthcheckTextWarning || p.isPreviewFilteredVesselsMode ? 'calc(100vh - 50px)' : '100vh')};
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
`
