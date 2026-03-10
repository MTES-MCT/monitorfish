import { resetAnimateToRegulatoryLayer } from '@features/Map/slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useCallback, useEffect, useRef } from 'react'

import { monitorfishMap } from '../monitorfishMap'

import type { AnimationOptions } from 'ol/View'
import type { RefObject } from 'react'

export function useMapAnimation(isInitRenderDone: RefObject<boolean>) {
  const dispatch = useMainAppDispatch()
  const isAnimating = useRef(false)
  const animateToRegulatoryLayer = useMainAppSelector(state => state.map.animateToRegulatoryLayer)

  const animateToLayer = useCallback(
    (_animateToRegulatoryLayer: any) => {
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
    [dispatch, isInitRenderDone]
  )

  useEffect(() => {
    animateToLayer(animateToRegulatoryLayer)
  }, [animateToRegulatoryLayer, animateToLayer])
}
