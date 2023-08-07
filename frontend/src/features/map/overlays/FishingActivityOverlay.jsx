import React, { createRef, useEffect, useState } from 'react'
import Overlay from 'ol/Overlay'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { useDispatch } from 'react-redux'
import { ReactComponent as AckNOkSVG } from '../../icons/Message_JPE_non_acquitte_clair.svg'
import { ReactComponent as DeletedSVG } from '../../icons/Suppression_clair.svg'
import navigateToFishingActivity from '../../../domain/use_cases/vessel/navigateToFishingActivity'

const FishingActivityOverlay = ({ map, id, name, coordinates, isDeleted, isNotAcknowledged }) => {
  const ref = createRef()
  const dispatch = useDispatch()
  const [overlay] = useState(new Overlay({
    element: ref.current,
    position: coordinates,
    offset: [0, -4],
    positioning: 'bottom-center'
  }))

  useEffect(() => {
    if (map && overlay) {
      overlay.setElement(ref.current)
      overlay.setPosition(coordinates)

      map.addOverlay(overlay)

      return () => {
        map.removeOverlay(overlay)
      }
    }
  }, [name, map, overlay])

  return (
    <div>
      <FishingActivityOverlayElement ref={ref}>
        <ZoneSelected
          title={`Voir le message ${isDeleted ? 'supprimé ' : ''}${isNotAcknowledged ? 'non acquitté' : ''}`}
          onClick={() => dispatch(navigateToFishingActivity(id))}
        >
          {
            isNotAcknowledged
              ? <AckNOk/>
              : null
          }
          {
            isDeleted
              ? <Deleted/>
              : null
          }
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

const FishingActivityOverlayElement = styled.div`
  z-index: 300;
`

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
  padding: 0 6px 1px 6px;
  vertical-align: top;
  height: 22px;
  display: inline-block;
  user-select: none;
  cursor: pointer;
`

const AckNOk = styled(AckNOkSVG)`
  width: 15px;
  margin: -2px 3px 1px 0;
`

const Deleted = styled(DeletedSVG)`
  width: 15px;
  margin: 0px 3px 2px 0;
`

export default FishingActivityOverlay
