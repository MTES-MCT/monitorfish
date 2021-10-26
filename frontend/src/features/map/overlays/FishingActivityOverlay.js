import React, { createRef, useEffect, useState } from 'react'
import Overlay from 'ol/Overlay'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { useDispatch } from 'react-redux'
import navigateToFishingActivity from '../../../domain/use_cases/navigateToFishingActivity'

const FishingActivityOverlay = ({ map, id, name, coordinates }) => {
  const ref = createRef()
  const dispatch = useDispatch()
  const [overlay] = useState(new Overlay({
    element: ref.current,
    position: coordinates,
    offset: [0, -4],
    positioning: 'bottom-center'
  }))

  useEffect(() => {
    if (map) {
      overlay.setElement(ref.current)
      overlay.setPosition(coordinates)

      map.addOverlay(overlay)

      return () => {
        map.removeOverlay(overlay)
      }
    }
  }, [name, map])

  return (
    <div>
      <FishingActivityOverlayElement ref={ref}>
        <ZoneSelected
          title={'Voir le message'}
          onClick={() => dispatch(navigateToFishingActivity(id))}
        >
          <ZoneText data-cy={'fishing-activity-name'}>{name}</ZoneText>
        </ZoneSelected>
        <TrianglePointer>
          <TriangleShadow/>
        </TrianglePointer>
      </FishingActivityOverlayElement>
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
  border-width: 9px 5px 0 5px;
  border-color: ${COLORS.charcoal} transparent;
  text-align: center;
  margin: auto;
  margin-top: -3px;
`

const FishingActivityOverlayElement = styled.div``

const ZoneText = styled.span`
  padding-bottom: 5px;
  vertical-align: middle;
  height: 30px;
  display: inline-block;
  user-select: none;
`

const ZoneSelected = styled.span`
  background: ${COLORS.charcoal};
  border-radius: 1px;
  color: ${COLORS.gainsboro};
  margin-left: 0;
  font-size: 14px;
  padding: 1px 5px 0px 5px;
  vertical-align: top;
  height: 22px;
  display: inline-block;
  user-select: none;
  cursor: pointer;
`

export default FishingActivityOverlay
