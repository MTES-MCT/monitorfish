import { useEffect, useState } from 'react'

import { useMainAppSelector } from './useMainAppSelector'

import type { InteractionListener, InteractionType } from '../domain/entities/map/constants'
import type { GeoJSON } from '../domain/types/GeoJSON'

type GeometryAndInteractionType = {
  drawedGeometry: GeoJSON.Geometry | undefined
  interactionType: InteractionType | undefined
}

export function useListenForDrawedGeometry(componentListener: InteractionListener) {
  const { drawedGeometry, interactionType, listener } = useMainAppSelector(state => state.draw)

  const [drawForListener, setDrawForListener] = useState<GeometryAndInteractionType>({
    drawedGeometry: undefined,
    interactionType: undefined
  })

  useEffect(() => {
    if (listener !== componentListener) {
      setDrawForListener({
        drawedGeometry: undefined,
        interactionType: undefined
      })

      return
    }

    setDrawForListener({
      drawedGeometry,
      interactionType
    })
  }, [drawedGeometry, listener, componentListener, interactionType])

  return drawForListener
}
