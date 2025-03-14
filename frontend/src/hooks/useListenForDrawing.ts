import { InteractionListener, type InteractionType } from '@features/Map/constants'
import { useEffect, useState } from 'react'

import { useMainAppSelector } from './useMainAppSelector'

import type { Geometry } from 'geojson'

type GeometryAndInteractionType = {
  drawedGeometry: Geometry | undefined
  interactionType: InteractionType | undefined
}

export function useListenForDrawedGeometry(componentListener: InteractionListener) {
  const drawedGeometry = useMainAppSelector(state => state.draw.drawedGeometry)
  const interactionType = useMainAppSelector(state => state.draw.interactionType)
  const listener = useMainAppSelector(state => state.draw.listener)

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
