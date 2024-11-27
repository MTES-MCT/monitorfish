import { MainMap } from '@features/MainMap/MainMap.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Point } from 'ol/geom'
import { useEffect, useRef, useState } from 'react'

import { monitorfishMap } from './monitorfishMap'
import MapMenuOverlay from './overlays/MapMenuOverlay'
import { HIT_PIXEL_TO_TOLERANCE } from '../../constants/constants'
import { LayerProperties } from '../MainMap/constants'
import { vesselSelectors } from '../Vessel/slice'

import type { VesselEnhancedLastPositionWebGLObject } from '../../domain/entities/vessel/types'

export function MapMenu() {
  const vessels = useMainAppSelector(state => vesselSelectors.selectAll(state.vessel.vessels))
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

      if (!clickedFeatureId?.toString()?.includes(LayerProperties[MainMap.MonitorFishLayer.VESSELS].code)) {
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
