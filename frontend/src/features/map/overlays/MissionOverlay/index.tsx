import Overlay from 'ol/Overlay'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { margins } from './constants'
import { MissionDetails } from './MissionDetails'
import { LayerType } from '../../../../domain/entities/layers/constants'
import { getOverlayPosition, getTopLeftMargin, OverlayPosition } from '../Overlay'

import type { Mission } from '../../../../domain/entities/mission/types'

const overlayHeight = 200

export function MissionDetailsOverlay({ feature, map }) {
  const [missionProperties, setMissionProperties] = useState<Mission.MissionPointFeatureProperties | undefined>(
    undefined
  )
  const overlayRef = useRef<HTMLDivElement>()
  const overlayObjectRef = useRef<Overlay | undefined>()
  const [overlayTopLeftMargin, setOverlayTopLeftMargin] = useState<[number, number]>([margins.yBottom, margins.xMiddle])
  const [overlayPosition, setOverlayPosition] = useState(OverlayPosition.BOTTOM)

  const overlayCallback = useCallback(
    ref => {
      overlayRef.current = ref
      if (!ref) {
        overlayObjectRef.current = undefined

        return
      }

      overlayObjectRef.current = new Overlay({
        autoPan: false,
        className: 'ol-overlay-container ol-selectable vessel-card',
        element: ref
      })
    },
    [overlayRef, overlayObjectRef]
  )

  useEffect(() => {
    if (!map) {
      return
    }

    map.addOverlay(overlayObjectRef.current)
  }, [map, overlayObjectRef])

  const getNextOverlayPosition = useCallback(() => {
    const [x, y] = feature.getGeometry().getCoordinates()
    const extent = map.getView().calculateExtent()
    const boxSize = map.getView().getResolution() * overlayHeight

    return getOverlayPosition(boxSize, x, y, extent)
  }, [feature, map])

  useEffect(() => {
    if (!overlayRef.current || !overlayObjectRef.current) {
      return
    }

    if (!feature?.getId()?.toString()?.includes(LayerType.MISSION)) {
      overlayRef.current.style.display = 'none'
      setMissionProperties(undefined)

      return
    }

    setMissionProperties(feature.getProperties() as Mission.MissionPointFeatureProperties)
    overlayRef.current.style.display = 'block'
    overlayObjectRef.current.setPosition(feature.getGeometry().getCoordinates())

    const nextOverlayPosition = getNextOverlayPosition()
    setOverlayPosition(nextOverlayPosition)

    setOverlayTopLeftMargin(getTopLeftMargin(nextOverlayPosition, margins))
  }, [feature, setMissionProperties, overlayRef, overlayObjectRef, getNextOverlayPosition])

  return (
    <VesselCardOverlayComponent ref={overlayCallback} overlayTopLeftMargin={overlayTopLeftMargin}>
      {missionProperties && <MissionDetails mission={missionProperties} overlayPosition={overlayPosition} />}
    </VesselCardOverlayComponent>
  )
}

const VesselCardOverlayComponent = styled.div<{
  overlayTopLeftMargin: [number, number]
}>`
  position: absolute;
  top: ${p => p.overlayTopLeftMargin[0]}px;
  left: ${p => p.overlayTopLeftMargin[1]}px;
  border-radius: 2px;
  z-index: 1000;
`
