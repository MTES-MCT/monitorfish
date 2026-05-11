import { useMapOverlay } from '@features/Map/components/Overlay/hooks/useMapOverlay'
import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import styled from 'styled-components'

import { VESSEL_CARD_BASE_HEIGHT, VESSEL_CARD_WIDTH } from './constants'
import { computeYOffset, getOverlayMargins, isVesselFeature } from './utils'
import { VesselCard } from './VesselCard'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'

export function VesselCardOverlay({ feature }) {
  const isSuperUser = useIsSuperUser()
  const yOffset = computeYOffset(feature, isSuperUser)
  const margins = getOverlayMargins(yOffset)
  const cardHeight = VESSEL_CARD_BASE_HEIGHT + yOffset

  const isVessel = isVesselFeature(feature)
  const coordinates = isVessel ? feature.getGeometry()?.getCoordinates() : undefined

  const { overlayElementRef, overlayPosition } = useMapOverlay({
    coordinates,
    margins,
    overlayHeight: cardHeight,
    zIndex: LayerProperties[MonitorFishMap.MonitorFishLayer.VESSELS].zIndex
  })

  return (
    <WrapperToBeKeptForDOMManagement>
      <VesselCardOverlayElement ref={overlayElementRef}>
        {isVessel && overlayPosition && (
          <VesselCard
            cardHeight={cardHeight}
            cardWidth={VESSEL_CARD_WIDTH}
            feature={feature}
            margins={margins}
            overlayPosition={overlayPosition}
          />
        )}
      </VesselCardOverlayElement>
    </WrapperToBeKeptForDOMManagement>
  )
}

/** Stays in the React DOM tree so React can cleanly unmount it. OL manages the inner div instead. */
const WrapperToBeKeptForDOMManagement = styled.div``
const VesselCardOverlayElement = styled.div``
