import { THEME } from '@mtes-mct/monitor-ui'
import Overlay from 'ol/Overlay'
import React, { createRef, useEffect, useState } from 'react'
import styled from 'styled-components'

import CloseIconSVG from '../../icons/Croix_grise.svg?react'
import { monitorfishMap } from '../../Map/monitorfishMap'

export function MeasurementOverlay({ coordinates, deleteFeature, id, measurement }) {
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
  height: auto;
  margin-left: auto;
  margin-right: auto;
  width: auto;
`

const TriangleShadow = styled.div`
  border-style: solid;
  border-width: 11px 6px 0 6px;
  border-color: ${THEME.color.gainsboro} transparent;
  height: 0;
  margin: -3px auto auto;
  text-align: center;
  width: 0;
`

const MeasurementOverlayElement = styled.div``

const ZoneText = styled.span`
  display: inline-block;
  height: 30px;
  padding-bottom: 5px;
  vertical-align: middle;
  user-select: none;
`

const ZoneSelected = styled.span`
  background: ${THEME.color.gainsboro};
  border-radius: 2px;
  color: ${THEME.color.slateGray};
  display: inline-block;
  font-size: 13px;
  height: 30px;
  margin-left: 0;
  padding: 0px 3px 0px 7px;
  vertical-align: top;
  user-select: none;
`

const CloseIcon = styled(CloseIconSVG)`
  border-left: 1px solid white;
  cursor: pointer;
  height: 30px;
  margin: 0 6px 0 7px;
  padding-left: 7px;
  vertical-align: text-bottom;
  width: 13px;
`
