import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../constants/constants'
import { expandRightMenu } from '../domain/reducers/Global'
import unselectVessel from '../domain/use_cases/unselectVessel'
import { MapButtonStyle } from '../components/commonStyles/MapButton.style'
import { useClickOutsideComponent } from '../hooks/useClickOutside'
import { ReactComponent as MeasurementSVG } from '../components/icons/Mesure.svg'
import SaveInterestPoint from '../components/interest_points/SaveInterestPoint'

const InterestPoint = () => {
  const dispatch = useDispatch()
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)
  const { healthcheckTextWarning } = useSelector(state => state.global)

  const firstUpdate = useRef(true)
  const [interestPointIsOpen, setInterestPointIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideComponent(wrapperRef)

  useEffect(() => {
    if (clickedOutsideComponent) {
      setInterestPointIsOpen(false)
    }
  }, [clickedOutsideComponent])

  useEffect(() => {
    if (interestPointIsOpen === true) {
      dispatch(unselectVessel())
      firstUpdate.current = false
      document.addEventListener('keydown', escapeFromKeyboard, false)
    }
  }, [interestPointIsOpen])

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
        healthcheckTextWarning={healthcheckTextWarning}
        isOpen={interestPointIsOpen}
        rightMenuIsOpen={rightMenuIsOpen}
        selectedVessel={selectedVessel}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title={'Créer un point d\'intérêt'}
        onClick={openOrCloseInterestPoint}>
        <MeasurementIcon rightMenuIsOpen={rightMenuIsOpen} selectedVessel={selectedVessel}/>
      </InterestPointWrapper>
      <SaveInterestPoint
        healthcheckTextWarning={healthcheckTextWarning}
        firstUpdate={firstUpdate.current}
        isOpen={interestPointIsOpen}/>
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
  color: #05055E;
  background: ${props => props.isOpen ? COLORS.textGray : COLORS.grayDarkerThree};
  top: 249px;
  z-index: 99;
  height: 40px;
  width: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '5px' : '40px'};
  border-radius: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '1px' : '2px'};
  right: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '10px'};
  transition: all 0.3s;

  :hover, :focus {
      background: ${COLORS.grayDarkerThree};
  }
`

const MeasurementIcon = styled(MeasurementSVG)`
  width: 40px;
  opacity: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '1'};
  transition: all 0.2s;
`

export default InterestPoint
