import React, { createRef, useEffect, useState } from 'react'
import Overlay from 'ol/Overlay'
import styled from 'styled-components'
import { COLORS } from '../constants/constants'
import { ReactComponent as CloseIconSVG } from '../components/icons/Croix_grise.svg'

const MeasureOverlay = ({ map, measure, coordinates, deleteFeature, id }) => {
  const ref = createRef()
  const [overlay] = useState(new Overlay({
    offset: [0, -15],
    positioning: 'bottom-center'
  }))

  useEffect(() => {
    if(map) {
      overlay.setElement(ref.current)
      overlay.setPosition(coordinates)
      overlay.setOffset([0, -7])

      map.addOverlay(overlay)

      return () => {
        map.removeOverlay(overlay)
      }
    }
  }, [measure, map])

  return (
    <div>
      <MeasureTooltipElements ref={ref} >
        <ZoneSelected>
            <ZoneText>{measure ? measure : null}</ZoneText>
            <CloseIcon onClick={() => deleteFeature(id)}/>
          </ZoneSelected>
          <TrianglePointer>
            <TriangleShadow/>
          </TrianglePointer>
      </MeasureTooltipElements>
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
  border-color: ${COLORS.grayBackground} transparent transparent transparent;
  text-align: center;
  margin: auto;
  margin-top: -3px;
`

const MeasureTooltipElements = styled.div``

const ZoneText = styled.span`
  padding-bottom: 5px;
  vertical-align: middle;
  height: 30px;
  display: inline-block;
  user-select: none;
`

const ZoneSelected = styled.span`
  background: ${COLORS.grayBackground};
  border-radius: 2px;
  color: ${COLORS.textGray};
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

export default MeasureOverlay
