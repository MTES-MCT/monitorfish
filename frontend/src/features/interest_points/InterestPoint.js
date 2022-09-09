import React, { useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../constants/constants'
import { expandRightMenu, setMapToolOpened } from '../../domain/shared_slices/Global'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { ReactComponent as InterestPointSVG } from '../icons/Point_interet.svg'
import EditInterestPoint from './EditInterestPoint'
import {
  deleteInterestPointBeingDrawed,
  drawInterestPoint,
  endInterestPointDraw
} from '../../domain/shared_slices/InterestPoint'
import { useEscapeFromKeyboard } from '../../hooks/useEscapeFromKeyboard'
import { MapTool } from '../../domain/entities/map'

const InterestPoint = () => {
  const dispatch = useDispatch()
  const {
    isEditing
  } = useSelector(state => state.interestPoint)
  const {
    healthcheckTextWarning,
    rightMenuIsOpen,
    previewFilteredVesselsMode,
    mapToolOpened
  } = useSelector(state => state.global)

  const isRightMenuShrinked = !rightMenuIsOpen
  const isInterestPointOpen = useMemo(() => mapToolOpened === MapTool.INTEREST_POINT, [mapToolOpened])
  const wrapperRef = useRef(null)
  const escapeFromKeyboard = useEscapeFromKeyboard()

  useEffect(() => {
    if (escapeFromKeyboard) {
      close()
    }
  }, [escapeFromKeyboard])

  function openOrCloseInterestPoint () {
    if (!isInterestPointOpen) {
      if (!isEditing) {
        dispatch(drawInterestPoint())
        dispatch(setMapToolOpened(MapTool.INTEREST_POINT))
      }
    } else {
      close()
    }
  }

  function close () {
    dispatch(endInterestPointDraw())
    dispatch(setMapToolOpened(undefined))
    if (!isEditing) {
      dispatch(deleteInterestPointBeingDrawed())
    }
  }

  return (
    <Wrapper ref={wrapperRef}>
      <InterestPointWrapper
        data-cy={'interest-point'}
        isHidden={previewFilteredVesselsMode}
        healthcheckTextWarning={healthcheckTextWarning}
        isOpen={isInterestPointOpen}
        rightMenuIsShrinked={isRightMenuShrinked}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title={'Créer un point d\'intérêt'}
        onClick={openOrCloseInterestPoint}
      >
        <InterestPointIcon
          $rightMenuIsShrinked={isRightMenuShrinked}
        />
      </InterestPointWrapper>
      <EditInterestPoint
        healthcheckTextWarning={healthcheckTextWarning}
        isOpen={isInterestPointOpen}
        close={close}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`

const InterestPointWrapper = styled(MapButtonStyle)`
  position: absolute;
  display: inline-block;
  background: ${props => props.isOpen ? COLORS.shadowBlue : COLORS.charcoal};
  top: 291px;
  z-index: 99;
  height: 40px;
  width: ${props => props.rightMenuIsShrinked ? '5px' : '40px'};
  border-radius: ${props => props.rightMenuIsShrinked ? '1px' : '2px'};
  right: ${props => props.rightMenuIsShrinked ? '0' : '10px'};
  transition: all 0.3s;

  :hover {
      background: ${COLORS.charcoal};
  }

  :focus {
      background: ${COLORS.shadowBlue};
  }
`

const InterestPointIcon = styled(InterestPointSVG)`
  width: 40px;
  opacity: ${props => props.$rightMenuIsShrinked ? '0' : '1'};
  transition: all 0.2s;
`

export default InterestPoint
