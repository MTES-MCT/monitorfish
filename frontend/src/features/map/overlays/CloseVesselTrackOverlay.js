import React, { createRef, useCallback, useEffect, useState } from 'react'
import Overlay from 'ol/Overlay'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import { ReactComponent as CloseVesselTrackSVG } from '../../icons/Croix_piste_VMS.svg'
import { hideVesselTrack } from '../../../domain/use_cases/vessel/hideVesselTrack'

const CloseVesselTrackOverlay = props => {
  const {
    map,
    coordinates,
    vesselCompositeIdentifier
  } = props

  const dispatch = useDispatch()

  const ref = createRef()
  const [overlay] = useState(new Overlay({
    element: ref.current,
    position: coordinates,
    positioning: 'top-left',
    zIndex: 9999,
    offset: [10, -25]
  }))

  const close = useCallback(() => {
    map.removeOverlay(overlay)
    dispatch(hideVesselTrack(vesselCompositeIdentifier))
  }, [map, overlay, vesselCompositeIdentifier])

  useEffect(() => {
    if (map && coordinates?.length) {
      overlay.setPosition(coordinates)
      overlay.setElement(ref.current)

      map.addOverlay(overlay)

      return () => {
        map.removeOverlay(overlay)
      }
    }
  }, [overlay, coordinates, map])

  return (
    <WrapperToBeKeptForDOMManagement>
      <div ref={ref}>
        <CloseVesselTrack
          data-cy={'close-vessel-track'}
          onClick={close}
        />
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

export default CloseVesselTrackOverlay
