import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../constants/constants'
import { expandRightMenu } from '../../domain/shared_slices/Global'
import unselectVessel from '../../domain/use_cases/vessel/unselectVessel'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { ReactComponent as InterestPointSVG } from '../icons/Point_interet.svg'
import SaveInterestPoint from './SaveInterestPoint'
import {
  deleteInterestPointBeingDrawed,
  drawInterestPoint,
  endInterestPointDraw
} from '../../domain/shared_slices/InterestPoint'

const InterestPoint = () => {
  const dispatch = useDispatch()
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const {
    isEditing,
    interestPointBeingDrawed
  } = useSelector(state => state.interestPoint)
  const {
    healthcheckTextWarning,
    rightMenuIsOpen,
    previewFilteredVesselsMode
  } = useSelector(state => state.global)

  const firstUpdate = useRef(true)
  const [interestPointIsOpen, setInterestPointIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (interestPointIsOpen) {
      dispatch(unselectVessel())
      firstUpdate.current = false
      document.addEventListener('keydown', escapeFromKeyboard, false)
      if (!isEditing) {
        dispatch(drawInterestPoint())
      }
    } else {
      dispatch(endInterestPointDraw())
      if (!isEditing) {
        dispatch(deleteInterestPointBeingDrawed())
      }
    }
  }, [interestPointIsOpen])

  useEffect(() => {
    setInterestPointIsOpen(isEditing)
  }, [isEditing])

  useEffect(() => {
    if (!interestPointBeingDrawed) {
      setInterestPointIsOpen(false)
    }
  }, [interestPointBeingDrawed])

  const escapeFromKeyboard = event => {
    const escapeKeyCode = 27
    if (event.keyCode === escapeKeyCode) {
      setInterestPointIsOpen(false)
    }
  }

  function openOrCloseInterestPoint () {
    setInterestPointIsOpen(!interestPointIsOpen)
  }

  return (
    <Wrapper ref={wrapperRef}>
      <InterestPointWrapper
        data-cy={'interest-point'}
        isHidden={previewFilteredVesselsMode}
        healthcheckTextWarning={healthcheckTextWarning}
        isOpen={interestPointIsOpen}
        rightMenuIsOpen={rightMenuIsOpen}
        selectedVessel={selectedVessel}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title={'Créer un point d\'intérêt'}
        onClick={openOrCloseInterestPoint}>
        <InterestPointIcon $rightMenuIsOpen={rightMenuIsOpen} $selectedVessel={selectedVessel}/>
      </InterestPointWrapper>
      <SaveInterestPoint
        healthcheckTextWarning={healthcheckTextWarning}
        firstUpdate={firstUpdate.current}
        isOpen={interestPointIsOpen}
        close={() => setInterestPointIsOpen(false)}/>
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
  width: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '5px' : '40px'};
  border-radius: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '1px' : '2px'};
  right: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '10px'};
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
  opacity: ${props => props.$selectedVessel && !props.$rightMenuIsOpen ? '0' : '1'};
  transition: all 0.2s;
`

export default InterestPoint
