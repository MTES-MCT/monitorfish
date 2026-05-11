import { useMapOverlay } from '@features/Map/components/Overlay/hooks/useMapOverlay'
import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

import { AISVesselCard } from './AISVesselCard'
import { AIS_CARD_HEIGHT, AIS_CARD_WIDTH, AIS_VESSEL_OVERLAY_CARD_MARGIN } from './constants'
import { isAISVesselFeature } from './utils'

export function AISVesselCardOverlay({ feature }) {
  const areAISVesselsDisplayed = useMainAppSelector(state => state.displayedComponent.areAISVesselsDisplayed)
  const shouldShow = isAISVesselFeature(feature) && areAISVesselsDisplayed
  const coordinates = shouldShow ? feature.getGeometry()?.getCoordinates() : undefined

  const { overlayElementRef, overlayPosition } = useMapOverlay({
    coordinates,
    margins: AIS_VESSEL_OVERLAY_CARD_MARGIN,
    overlayHeight: AIS_CARD_HEIGHT,
    zIndex: LayerProperties[MonitorFishMap.MonitorFishLayer.AIS_VESSELS].zIndex
  })

  return (
    <WrapperToBeKeptForDOMManagement>
      <VesselCardOverlayElement ref={overlayElementRef}>
        {shouldShow && overlayPosition && (
          <AISVesselCard
            cardHeight={AIS_CARD_HEIGHT}
            cardWidth={AIS_CARD_WIDTH}
            feature={feature}
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
