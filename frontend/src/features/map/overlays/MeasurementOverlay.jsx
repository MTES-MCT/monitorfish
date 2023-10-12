import Overlay from 'ol/Overlay'
import React, { createRef, useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import CloseIconSVG from '../../icons/Croix_grise.svg?react'
import { monitorfishMap } from '../monitorfishMap'

function MeasurementOverlay({ coordinates, deleteFeature, id, measurement }) {
  const ref = createRef()
  const [overlay] = useState(
    new Overlay({
      element: ref.current,
      offset: [0, -7],
      position: coordinates,
      positioning: 'bottom-center'
    })
  )

  useEffect(() => {
    overlay.setElement(ref.current)
    overlay.setPosition(coordinates)

    monitorfishMap.addOverlay(overlay)

    return () => {
      monitorfishMap.removeOverlay(overlay)
    }
  }, [measurement])

  return (
    <div>
      <MeasurementOverlayElement ref={ref}>
        <ZoneSelected>
          <ZoneText data-cy="measurement-value">{measurement}</ZoneText>
          <CloseIcon data-cy="close-measurement" onClick={() => deleteFeature(id)} />
        </ZoneSelected>
        <TrianglePointer>
          <TriangleShadow />
        </TrianglePointer>
      </MeasurementOverlayElement>
    </div>
  )
}

const TrianglePointer = styled.div`
  margin-left: auto;
  margin-right: auto;
  height: auto;
  width: auto;
`

const TriangleShadow = styled.div`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 11px 6px 0 6px;
  border-color: ${COLORS.gainsboro} transparent;
  text-align: center;
  margin: auto;
  margin-top: -3px;
`

const MeasurementOverlayElement = styled.div``

const ZoneText = styled.span`
  padding-bottom: 5px;
  vertical-align: middle;
  height: 30px;
  display: inline-block;
  user-select: none;
`

const ZoneSelected = styled.span`
  background: ${COLORS.gainsboro};
  border-radius: 2px;
  color: ${COLORS.slateGray};
  margin-left: 0;
  font-size: 13px;
  padding: 0px 3px 0px 7px;
  vertical-align: top;
  height: 30px;
  display: inline-block;
  user-select: none;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  vertical-align: text-bottom;
  cursor: pointer;
  border-left: 1px solid white;
  height: 30px;
  margin: 0 6px 0 7px;
  padding-left: 7px;
`

export default MeasurementOverlay
