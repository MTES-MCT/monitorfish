import { Point } from 'ol/geom'
import { useEffect, useRef, useState } from 'react'

import { monitorfishMap } from './monitorfishMap'
import MapMenuOverlay from './overlays/MapMenuOverlay'
import { HIT_PIXEL_TO_TOLERANCE } from '../../constants/constants'
import { LayerProperties } from '../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../domain/entities/layers/types'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

import type { VesselEnhancedLastPositionWebGLObject } from '../../domain/entities/vessel/types'

export function MapMenu() {
  const { vessels } = useMainAppSelector(state => state.vessel)
  const [coordinates, setCoordinates] = useState<number[]>([])
  const vessel = useRef<VesselEnhancedLastPositionWebGLObject | undefined>()

  useEffect(() => {
    function showMenu(event) {
      event.preventDefault()

      const pixel = monitorfishMap.getEventPixel(event)
      const feature = monitorfishMap.forEachFeatureAtPixel(pixel, pixelFeature => pixelFeature, {
        hitTolerance: HIT_PIXEL_TO_TOLERANCE
      })
      const clickedFeatureId = feature?.getId()

      if (!clickedFeatureId?.toString()?.includes(LayerProperties[MonitorFishLayer.VESSELS].code)) {
        vessel.current = undefined
        setCoordinates([])

        return
      }

      const clickedVessel = vessels.find(lastPositionVessel => clickedFeatureId === lastPositionVessel.vesselFeatureId)
      if (!clickedVessel) {
        return
      }

      vessel.current = clickedVessel
      setCoordinates((feature?.getGeometry() as Point)?.getCoordinates())
    }

    monitorfishMap.getViewport().addEventListener('contextmenu', showMenu)

    return () => {
      monitorfishMap.getViewport().removeEventListener('contextmenu', showMenu)
    }
  }, [vessels])

  return (
    <>
      <MapMenuOverlay coordinates={coordinates} vessel={vessel.current} />
    </>
  )
}
