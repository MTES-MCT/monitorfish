import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as MeasureSVG } from '../components/icons/Mesure.svg'
import { ReactComponent as MultiLineSVG } from '../components/icons/Mesure_ligne_brisee.svg'
import { COLORS } from '../constants/constants'
import { setMeasure } from '../domain/reducers/Map'
import { expandRightMenu } from '../domain/reducers/Global'
import unselectVessel from '../domain/use_cases/unselectVessel'
import { MeasureTypes } from '../domain/entities/map'

const Measure = () => {
  const dispatch = useDispatch()
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)
  const temporaryVesselsToHighLightOnMap = useSelector(state => state.vessel.temporaryVesselsToHighLightOnMap)

  const firstUpdate = useRef(true)
  const [MeasureIsOpen, setMeasureIsOpen] = useState(false)
  const [isShowed, setIsShowed] = useState(true)

  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside (event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMeasureIsOpen(false)
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [wrapperRef])

  useEffect(() => {
    if (MeasureIsOpen === true) {
      dispatch(unselectVessel())
      firstUpdate.current = false
    }
  }, [MeasureIsOpen])

  useEffect(() => {
    if (temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length) {
      setIsShowed(false)
    } else {
      setIsShowed(true)
    }
  }, [temporaryVesselsToHighLightOnMap])

  const makeMeasure = () => {
    dispatch(setMeasure(MeasureTypes.MULTILINE))
  }

  return (
    <Wrapper isShowed={isShowed} ref={wrapperRef}>
      <MeasureWrapper
        rightMenuIsOpen={rightMenuIsOpen}
        selectedVessel={selectedVessel}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title={'Mesurer une distance'}
        onClick={() => setMeasureIsOpen(!MeasureIsOpen)}>
        <MeasureIcon
          rightMenuIsOpen={rightMenuIsOpen}
          selectedVessel={selectedVessel}/>
      </MeasureWrapper>
      <MeasureBox
        vesselVisibilityBoxIsOpen={MeasureIsOpen}
        firstUpdate={firstUpdate.current}>
        <MultiLine
          title={'Mesure d\'une distance avec lignes brisées'}
          onClick={() => makeMeasure()}>
          <MultiLineIcon/>
        </MultiLine>
      </MeasureBox>
    </Wrapper>
  )
}

const MultiLine = styled.div`
  position: absolute;
  display: inline-block;
  color: #05055E;
  background: ${COLORS.textGray};
  padding: 0;
  z-index: 99;
  right: 0;
  height: 40px;
  width: 40px;
  border-radius: 2px;
  cursor: pointer;
`

const MultiLineIcon = styled(MultiLineSVG)`
  width: 40px;
  height: 40px;
  margin-top: 1px;
`

const Wrapper = styled.div`
  animation: ${props => props.isShowed ? 'vessel-visibility-opening' : 'vessel-visibility-closing'} 0.2s ease forwards;
  @keyframes vessel-visibility-opening {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes vessel-visibility-closing {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
  z-index: 1000;
`

const MeasureBox = styled.div`
  width: 175px;
  margin-right: -200px;
  top: 165px;
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  animation: ${props => props.firstUpdate && !props.vesselVisibilityBoxIsOpen ? '' : props.vesselVisibilityBoxIsOpen ? 'vessel-visibility-box-opening' : 'vessel-visibility-box-closing'} 0.5s ease forwards;

  @keyframes vessel-visibility-box-opening {
    0%   { margin-right: -200px; opacity: 0;  }
    100% { margin-right: 45px; opacity: 1; }
  }

  @keyframes vessel-visibility-box-closing {
    0% { margin-right: 45px; opacity: 1; }
    100%   { margin-right: -200px; opacity: 0;  }
  }
`

const MeasureWrapper = styled.button`
  position: absolute;
  display: inline-block;
  color: #05055E;
  background: ${COLORS.grayDarkerThree};
  padding: 3px 0px 0 3px;
  top: 157px;
  z-index: 99;
  right: 10px;
  height: 40px;
  width: 40px;
  border-radius: 2px;
  margin-top: 8px;
  
  animation: ${props => props.selectedVessel && !props.rightMenuIsOpen ? 'vessel-visibility-icon-closing' : 'vessel-visibility-icon-opening'} 0.3s ease forwards;
  
  @keyframes vessel-visibility-icon-opening {
    0%   {
      width: 5px;
      border-radius: 1px;
      right: 0;
     }
    100% {
      width: 40px;
      border-radius: 2px;
      right: 10px;
    }
  }

  @keyframes vessel-visibility-icon-closing {
    0% {
      width: 40px;
      border-radius: 2px;
      right: 10px;
    }
    100%   {
      width: 5px;
      border-radius: 1px;
      right: 0;
    }
  }

  :hover, :focus {
      background: ${COLORS.grayDarkerThree};
  }
`

const MeasureIcon = styled(MeasureSVG)`
  width: 39px;
  margin-top: -3px;
  margin-left: -2px;
  animation: ${props => props.selectedVessel && !props.rightMenuIsOpen ? 'visibility-icon-hidden' : 'visibility-icon-visible'} 0.2s ease forwards;
  
  @keyframes visibility-icon-visible {
    0%   {
      opacity: 0;
     }
    100% {
      opacity: 1;
    }
  }

  @keyframes visibility-icon-hidden {
    0% {
      opacity: 1;
    }
    100%   {
      opacity: 0;
    }
  }
`

export default Measure
