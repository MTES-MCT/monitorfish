import React, { createRef, useEffect, useState } from 'react'
import Overlay from 'ol/Overlay'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import { ReactComponent as CloseVesselTrackSVG } from '../../icons/Croix_piste_VMS.svg'
import hideVesselTrack from '../../../domain/use_cases/hideVesselTrack'

const CloseVesselTrackOverlay = props => {
  const {
    map,
    coordinates,
    identity
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
  const [close, setClose] = useState(false)

  useEffect(() => {
    if (close) {
      map.removeOverlay(overlay)
      dispatch(hideVesselTrack(identity))
    }
  }, [close])

  useEffect(() => {
    if (map && coordinates?.length) {
      overlay.setPosition(coordinates)
      overlay.setElement(ref.current)
      ref.current.parentNode.className = 'ol-overlay-container ol-selectable overlay-active'

      map.addOverlay(overlay)

      return () => {
        map.removeOverlay(overlay)
      }
    }
  }, [overlay, coordinates, map])

  return (
    <WrapperToBeKeptForDOMManagement>
      <div ref={ref}>
        <CloseVesselTrack onClick={() => setClose(true)}/>
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
