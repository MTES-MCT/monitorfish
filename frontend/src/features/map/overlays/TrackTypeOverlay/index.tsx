import { useMainAppSelector } from '@hooks/useMainAppSelector'
import Overlay from 'ol/Overlay'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { TrackTypeCard } from './TrackTypeCard'
import { COLORS } from '../../../../constants/constants'
import { LayerProperties } from '../../../MainMap/constants'
import { monitorfishMap } from '../../monitorfishMap'

import type { FeatureWithCodeAndEntityId } from '@libs/FeatureWithCodeAndEntityId'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

type TrackTypeOverlayProps = Readonly<{
  feature: Feature<Geometry> | FeatureWithCodeAndEntityId<Geometry> | undefined
}>
export function TrackTypeOverlay({ feature }: TrackTypeOverlayProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const overlayObjectRef = useRef<Overlay | null>(null)

  const mousePosition = useMainAppSelector(state => state.mainMap.mousePosition)

  const [trackTypeToShowOnCard, setTrackTypeToShowOnCard] = useState(null)

  const overlayCallback = useCallback(
    ref => {
      overlayRef.current = ref

      if (!ref) {
        overlayObjectRef.current = null

        return
      }

      overlayObjectRef.current = new Overlay({
        autoPan: true,
        className: 'ol-overlay-container ol-selectable',
        element: ref
      })
    },
    [overlayRef, overlayObjectRef]
  )

  useEffect(() => {
    if (overlayObjectRef.current) {
      monitorfishMap.addOverlay(overlayObjectRef.current)
    }
  }, [overlayObjectRef])

  useEffect(() => {
    if (!overlayRef.current || !overlayObjectRef.current) {
      return
    }

    if (
      !feature?.getId()?.toString()?.includes(LayerProperties.VESSEL_TRACK.code) ||
      !feature?.getId()?.toString()?.includes('line')
    ) {
      setTrackTypeToShowOnCard(null)
      overlayRef.current.style.display = 'none'

      return
    }

    // TODO Create a custom `Feature` type to avoid using `any`.
    setTrackTypeToShowOnCard((feature as any).trackType)
    overlayRef.current.style.display = 'block'
    if (mousePosition) {
      overlayObjectRef.current.setPosition(monitorfishMap.getCoordinateFromPixel(mousePosition))
    }
  }, [setTrackTypeToShowOnCard, mousePosition, feature])

  return (
    <TrackTypeCardOverlayComponent ref={overlayCallback}>
      {trackTypeToShowOnCard && <TrackTypeCard trackType={trackTypeToShowOnCard} />}
    </TrackTypeCardOverlayComponent>
  )
}

const TrackTypeCardOverlayComponent = styled.div`
  position: absolute;
  top: -39px;
  left: -56px;
  width: 100px;
  text-align: left;
  background-color: ${COLORS.gainsboro};
  border-radius: 2px;
  z-index: 100;
`
