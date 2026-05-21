import { useMapOverlay } from '@features/Map/components/Overlay/hooks/useMapOverlay'
import styled from 'styled-components'

import CloseVesselTrackSVG from '../../icons/Croix_piste_VMS.svg?react'

type CloseVesselTrackOverlayProps = {
  coordinates: number[] | undefined
  onClose: () => void
}
export function CloseVesselTrackOverlay({ coordinates, onClose }: CloseVesselTrackOverlayProps) {
  const { overlayElementRef } = useMapOverlay({
    coordinates,
    initialOffset: [10, -25],
    positioning: 'top-left',
    zIndex: 9999
  })

  return (
    <WrapperToBeKeptForDOMManagement>
      <div ref={overlayElementRef}>
        <CloseVesselTrack data-cy="close-vessel-track" onClick={onClose} />
      </div>
    </WrapperToBeKeptForDOMManagement>
  )
}

const CloseVesselTrack = styled(CloseVesselTrackSVG)`
  width: 18px;
  cursor: pointer;
`

const WrapperToBeKeptForDOMManagement = styled.div`
  z-index: 450;
`
