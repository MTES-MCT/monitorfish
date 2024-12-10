import { COLORS } from '@constants/constants'
import { getOverlayPosition, getTopLeftMargin, OverlayPosition } from '@features/Map/components/Overlay'
import { MonitorFishMap } from '@features/Map/Map.types'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { getMapResolution } from '@features/Map/utils'
import Overlay from 'ol/Overlay'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { marginsWithOneWarning, marginsWithoutAlert, marginsWithThreeWarning, marginsWithTwoWarning } from './constants'
import { VesselCard } from './VesselCard'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'

const overlayHeight = 260

export function VesselCardOverlay({ feature }) {
  const isSuperUser = useIsSuperUser()
  const [vesselFeatureToShowOnCard, setVesselFeatureToShowOnCard] = useState(null)
  const overlayRef = useRef<HTMLDivElement>()
  const overlayObjectRef = useRef<Overlay | undefined>()
  const [overlayTopLeftMargin, setOverlayTopLeftMargin] = useState<[number, number]>([
    marginsWithoutAlert.yBottom,
    marginsWithoutAlert.xMiddle
  ])
  const [overlayPosition, setOverlayPosition] = useState(OverlayPosition.BOTTOM)
  const numberOfWarningsRef = useRef<number>(0)

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
    if (overlayObjectRef.current) {
      monitorfishMap.addOverlay(overlayObjectRef.current)
    }
  }, [overlayObjectRef])

  const getNextOverlayPosition = useCallback(
    numberOfWarnings => {
      const [x, y] = feature.getGeometry().getCoordinates()
      const extent = monitorfishMap.getView().calculateExtent()
      const boxSize = getMapResolution() * overlayHeight + (numberOfWarnings ? 30 * numberOfWarnings : 0)

      return getOverlayPosition(boxSize, x, y, extent)
    },
    [feature]
  )

  useEffect(() => {
    if (!overlayRef.current || !overlayObjectRef.current) {
      return
    }

    if (!feature?.getId()?.toString()?.includes(MonitorFishMap.MonitorFishLayer.VESSELS)) {
      overlayRef.current.style.display = 'none'
      setVesselFeatureToShowOnCard(null)

      return
    }

    setVesselFeatureToShowOnCard(feature)
    numberOfWarningsRef.current = isSuperUser
      ? Number(feature?.get('hasAlert')) +
        Number(!!feature?.get('beaconMalfunctionId')) +
        Number(feature?.get('hasInfractionSuspicion'))
      : 0
    overlayRef.current.style.display = 'block'
    overlayObjectRef.current.setPosition(feature.getGeometry().getCoordinates())

    const nextOverlayPosition = getNextOverlayPosition(numberOfWarningsRef.current)
    setOverlayPosition(nextOverlayPosition)

    let margins
    switch (numberOfWarningsRef.current) {
      case 1:
        margins = marginsWithOneWarning
        break
      case 2:
        margins = marginsWithTwoWarning
        break
      case 3:
        margins = marginsWithThreeWarning
        break
      default:
        margins = marginsWithoutAlert
    }

    setOverlayTopLeftMargin(getTopLeftMargin(nextOverlayPosition, margins))
  }, [feature, setVesselFeatureToShowOnCard, overlayRef, overlayObjectRef, isSuperUser, getNextOverlayPosition])

  return (
    <VesselCardOverlayComponent ref={overlayCallback} $overlayTopLeftMargin={overlayTopLeftMargin}>
      {vesselFeatureToShowOnCard && (
        <VesselCard
          feature={vesselFeatureToShowOnCard}
          numberOfWarnings={numberOfWarningsRef.current}
          overlayPosition={overlayPosition}
        />
      )}
    </VesselCardOverlayComponent>
  )
}

const VesselCardOverlayComponent = styled.div<{
  $overlayTopLeftMargin: [number, number]
}>`
  position: absolute;
  top: ${p => p.$overlayTopLeftMargin[0]}px;
  left: ${p => p.$overlayTopLeftMargin[1]}px;
  width: 387px;
  text-align: left;
  background-color: ${COLORS.gainsboro};
  border-radius: 2px;
  z-index: 1000;
`
