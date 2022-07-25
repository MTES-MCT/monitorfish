import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../constants/constants'
import { expandRightMenu } from '../../domain/shared_slices/Global'
import unselectVessel from '../../domain/use_cases/vessel/unselectVessel'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { ReactComponent as InterestPointSVG } from '../icons/Point_interet.svg'
import EditInterestPoint from './EditInterestPoint'
import {
  deleteInterestPointBeingDrawed,
  drawInterestPoint,
  endInterestPointDraw
} from '../../domain/shared_slices/InterestPoint'

const InterestPoint = () => {
  const dispatch = useDispatch()
  const vesselSidebarIsOpen = useSelector(state => state.vessel.selectedVessel)
  const {
    isEditing,
    interestPointBeingDrawed
  } = useSelector(state => state.interestPoint)
  const {
    healthcheckTextWarning,
    rightMenuIsOpen,
    previewFilteredVesselsMode
  } = useSelector(state => state.global)

  const rightMenuIsShrinked = vesselSidebarIsOpen && !rightMenuIsOpen
  const interestPointIsOpen = isEditing || interestPointBeingDrawed
  const wrapperRef = useRef(null)

  useEffect(() => {
    document.addEventListener('keydown', escapeFromKeyboard)

    return () => {
      document.removeEventListener('keydown', escapeFromKeyboard)
    }
  }, [])

  const escapeFromKeyboard = event => {
    const escapeKeyCode = 27
    if (event.keyCode === escapeKeyCode) {
      close()
    }
  }

  function openOrCloseInterestPoint () {
    if (!interestPointIsOpen) {
      dispatch(unselectVessel())

      if (!isEditing) {
        dispatch(drawInterestPoint())
      }
    } else {
      close()
    }
  }

  function close () {
    dispatch(endInterestPointDraw())
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
        isOpen={interestPointIsOpen}
        rightMenuIsShrinked={rightMenuIsShrinked}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title={'Créer un point d\'intérêt'}
        onClick={openOrCloseInterestPoint}
      >
        <InterestPointIcon
          $rightMenuIsShrinked={rightMenuIsShrinked}
        />
      </InterestPointWrapper>
      <EditInterestPoint
        healthcheckTextWarning={healthcheckTextWarning}
        isOpen={interestPointIsOpen}
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
