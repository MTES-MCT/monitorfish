import { useEffect, useState } from 'react'

import { useMainAppSelector } from './useMainAppSelector'

import type { InteractionListener, InteractionType } from '../domain/entities/map/constants'
import type { GeoJSON } from '../domain/types/GeoJSON'

type GeometryAndInteractionType = {
  geometry: GeoJSON.Geometry | undefined
  interactionType: InteractionType | undefined
}

export function useListenForDrawedGeometry(componentListener: InteractionListener) {
  const { geometry, interactionType, listener } = useMainAppSelector(state => state.draw)

  const [drawForListener, setDrawForListener] = useState<GeometryAndInteractionType>({
    geometry: undefined,
    interactionType: undefined
  })

  useEffect(() => {
    if (listener !== componentListener) {
      setDrawForListener({
        geometry: undefined,
        interactionType: undefined
      })

      return
    }

    setDrawForListener({
      geometry,
      interactionType
    })
  }, [geometry, listener, componentListener, interactionType])

  return drawForListener
}
