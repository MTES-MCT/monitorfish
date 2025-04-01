import { COLORS } from '@constants/constants'
import { getOverlayPosition, getTopLeftMargin, OverlayPosition } from '@features/Map/components/Overlay'
import { MonitorFishMap } from '@features/Map/Map.types'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { getMapResolution } from '@features/Map/utils'
import { getOverlayMargins } from '@features/Vessel/components/VesselCardOverlay/utils'
import Overlay from 'ol/Overlay'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { marginsWithoutAlert } from './constants'
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

  const numberOfWarnings = isSuperUser
    ? Number(feature?.get('hasAlert')) +
      Number(!!feature?.get('beaconMalfunctionId')) +
      Number(feature?.get('hasInfractionSuspicion'))
    : 0
  const vesselGroupsAddedLines = Number(feature?.get('groupsDisplayed')?.length)
  const numberOfGroupsHidden = Number(feature?.get('numberOfGroupsHidden'))
  const numberOfWarningsOffset = numberOfWarnings * 28
  const vesselGroupsAddedLinesOffset =
    (vesselGroupsAddedLines > 0 || numberOfGroupsHidden > 0 ? 19.8 : 0) + vesselGroupsAddedLines * 27
  const numberOfGroupsHiddenOffset = numberOfGroupsHidden > 0 ? 20 : 0
  const yOffset = numberOfWarningsOffset + vesselGroupsAddedLinesOffset + numberOfGroupsHiddenOffset

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

  const getNextOverlayPosition = () => {
    const [x, y] = feature.getGeometry().getCoordinates()
    const extent = monitorfishMap.getView().calculateExtent()

    const boxSize = getMapResolution() * overlayHeight + yOffset

    return getOverlayPosition(boxSize, x, y, extent)
  }

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
    overlayRef.current.style.display = 'block'
    overlayObjectRef.current.setPosition(feature.getGeometry().getCoordinates())

    const nextOverlayPosition = getNextOverlayPosition()
    setOverlayPosition(nextOverlayPosition)

    const margins = getOverlayMargins(yOffset)

    setOverlayTopLeftMargin(getTopLeftMargin(nextOverlayPosition, margins))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feature, setVesselFeatureToShowOnCard, overlayRef, overlayObjectRef])

  return (
    <VesselCardOverlayComponent ref={overlayCallback} $overlayTopLeftMargin={overlayTopLeftMargin}>
      {vesselFeatureToShowOnCard && (
        <VesselCard feature={vesselFeatureToShowOnCard} overlayPosition={overlayPosition} yOffset={yOffset} />
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
