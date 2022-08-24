import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { expandRightMenu } from '../../domain/shared_slices/Global'
import {
  deleteInterestPointBeingDrawed,
  drawInterestPoint,
  endInterestPointDraw,
} from '../../domain/shared_slices/InterestPoint'
import unselectVessel from '../../domain/use_cases/vessel/unselectVessel'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { ReactComponent as InterestPointSVG } from '../icons/Point_interet.svg'
import EditInterestPoint from './EditInterestPoint'

function InterestPoint() {
  const dispatch = useDispatch()
  const vesselSidebarIsOpen = useSelector(state => state.vessel.selectedVessel)
  const { interestPointBeingDrawed, isEditing } = useSelector(state => state.interestPoint)
  const { healthcheckTextWarning, previewFilteredVesselsMode, rightMenuIsOpen } = useSelector(state => state.global)

  const isRightMenuShrinked = vesselSidebarIsOpen && !rightMenuIsOpen
  const isInterestPointOpen = isEditing || interestPointBeingDrawed
  const wrapperRef = useRef(null)

  useEffect(() => {
    document.addEventListener('keydown', escapeFromKeyboard)

    return () => {
      document.removeEventListener('keydown', escapeFromKeyboard)
    }
  }, [])

  const escapeFromKeyboard = event => {
    if (event.key === 'Escape') {
      close()
    }
  }

  function openOrCloseInterestPoint() {
    if (!isInterestPointOpen) {
      dispatch(unselectVessel())

      if (!isEditing) {
        dispatch(drawInterestPoint())
      }
    } else {
      close()
    }
  }

  function close() {
    dispatch(endInterestPointDraw())
    if (!isEditing) {
      dispatch(deleteInterestPointBeingDrawed())
    }
  }

  return (
    <Wrapper ref={wrapperRef}>
      <InterestPointWrapper
        data-cy="interest-point"
        healthcheckTextWarning={healthcheckTextWarning}
        isHidden={previewFilteredVesselsMode}
        isOpen={isInterestPointOpen}
        onClick={openOrCloseInterestPoint}
        onMouseEnter={() => dispatch(expandRightMenu())}
        rightMenuIsShrinked={isRightMenuShrinked}
        title={"Créer un point d'intérêt"}
      >
        <InterestPointIcon $rightMenuIsShrinked={isRightMenuShrinked} />
      </InterestPointWrapper>
      <EditInterestPoint close={close} healthcheckTextWarning={healthcheckTextWarning} isOpen={isInterestPointOpen} />
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
  background: ${props => (props.isOpen ? COLORS.shadowBlue : COLORS.charcoal)};
  top: 291px;
  z-index: 99;
  height: 40px;
  width: ${props => (props.rightMenuIsShrinked ? '5px' : '40px')};
  border-radius: ${props => (props.rightMenuIsShrinked ? '1px' : '2px')};
  right: ${props => (props.rightMenuIsShrinked ? '0' : '10px')};
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
  opacity: ${props => (props.$rightMenuIsShrinked ? '0' : '1')};
  transition: all 0.2s;
`

export default InterestPoint
