import Overlay from 'ol/Overlay'
import React, { createRef, useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import hideVesselTrack from '../../../domain/use_cases/vessel/hideVesselTrack'
import { ReactComponent as CloseVesselTrackSVG } from '../../icons/Croix_piste_VMS.svg'

function CloseVesselTrackOverlay(props) {
  const { coordinates, map, vesselId } = props

  const dispatch = useDispatch()

  const ref = createRef()
  const [overlay] = useState(
    new Overlay({
      element: ref.current,
      offset: [10, -25],
      position: coordinates,
      positioning: 'top-left',
      zIndex: 9999,
    }),
  )

  const close = useCallback(() => {
    map.removeOverlay(overlay)
    dispatch(hideVesselTrack(vesselId))
  }, [map, overlay, vesselId])

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
        <CloseVesselTrack data-cy="close-vessel-track" onClick={close} />
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
