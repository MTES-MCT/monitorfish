import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import CoordinateInput from 'react-coordinate-input'

import { ReactComponent as MeasurementSVG } from '../components/icons/Mesure.svg'
import { ReactComponent as MultiLineSVG } from '../components/icons/Mesure_ligne_brisee.svg'
import { ReactComponent as CircleRangeSVG } from '../components/icons/Mesure_rayon_action.svg'
import { COLORS } from '../constants/constants'
import { setCircleMeasurementToAdd, setMeasurementTypeToAdd } from '../domain/reducers/Map'
import { expandRightMenu } from '../domain/reducers/Global'
import unselectVessel from '../domain/use_cases/unselectVessel'
import { MeasurementTypes } from '../domain/entities/map'

const Measurement = () => {
  const dispatch = useDispatch()
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)
  const measurementTypeToAdd = useSelector(state => state.map.measurementTypeToAdd)
  const temporaryVesselsToHighLightOnMap = useSelector(state => state.vessel.temporaryVesselsToHighLightOnMap)

  const firstUpdate = useRef(true)
  const [measurementIsOpen, setMeasurementIsOpen] = useState(false)
  const [isShowed, setIsShowed] = useState(true)
  const [circleCoordinatesToAdd, setCircleCoordinatesToAdd] = useState([])
  const [circleRadiusToAdd, setCircleRadiusToAdd] = useState('')

  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside (event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMeasurementIsOpen(false)
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
    if (measurementIsOpen === true) {
      dispatch(unselectVessel())
      firstUpdate.current = false
      document.addEventListener('keydown', escapeFromKeyboard, false)
    }
  }, [measurementIsOpen])

  useEffect(() => {
    if (temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length) {
      setIsShowed(false)
    } else {
      setIsShowed(true)
    }
  }, [temporaryVesselsToHighLightOnMap])

  const escapeFromKeyboard = event => {
    const escapeCode = 27
    if (event.keyCode === escapeCode) {
      dispatch(setMeasurementTypeToAdd(null))
      setMeasurementIsOpen(false)
    }
  }

  const makeMeasurement = measurementType => {
    dispatch(setMeasurementTypeToAdd(measurementType))
    setMeasurementIsOpen(false)
  }

  const getMeasurementIcon = measurementType => {
    let icon = <MeasurementIcon
      rightMenuIsOpen={rightMenuIsOpen}
      selectedVessel={selectedVessel}/>

    switch (measurementType) {
      case MeasurementTypes.MULTILINE: icon = <MultiLineIcon/>; break
      case MeasurementTypes.CIRCLE_RANGE: icon = <CircleRangeIcon/>; break
    }

    return icon
  }

  function openOrCloseMeasurement () {
    if (measurementTypeToAdd) {
      dispatch(setMeasurementTypeToAdd(null))
      setMeasurementIsOpen(false)
    } else {
      setMeasurementIsOpen(!measurementIsOpen)
    }
  }

  return (
    <Wrapper isShowed={isShowed} ref={wrapperRef}>
      <MeasurementWrapper
        isMeasuring={measurementTypeToAdd}
        rightMenuIsOpen={rightMenuIsOpen}
        selectedVessel={selectedVessel}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title={'Mesurer une distance'}
        onClick={() => openOrCloseMeasurement()}>
        {
          getMeasurementIcon(measurementTypeToAdd)
        }
      </MeasurementWrapper>
      <MeasurementOptions
        measurementBoxIsOpen={measurementIsOpen}
        firstUpdate={firstUpdate.current}>
        <MeasurementItem
          title={'Mesure d\'une distance avec lignes brisées'}
          onClick={() => makeMeasurement(MeasurementTypes.MULTILINE)}>
          <MultiLineIcon/>
        </MeasurementItem>
        <MeasurementItem
          title={'Rayon d\'action'}
          onClick={() => makeMeasurement(MeasurementTypes.CIRCLE_RANGE)}>
          <CircleRangeIcon/>
        </MeasurementItem>
      </MeasurementOptions>
      <CircleRangeValue
        firstUpdate={firstUpdate.current}
        isOpen={measurementTypeToAdd === MeasurementTypes.CIRCLE_RANGE}>
        <Header isFirst={true}>
          Définir une valeur
        </Header>
        <Body>
          <p>Coordonnées</p>
          <CoordinateInput
            onChange={(_, { unmaskedValue, dd, dms }) => setCircleCoordinatesToAdd(dd)}
            value={circleCoordinatesToAdd && Array.isArray(circleCoordinatesToAdd) && circleCoordinatesToAdd.length
              ? circleCoordinatesToAdd.join(',')
              : undefined}
          />
          <span>(DMS)</span>
          <p>Distance (rayon)</p>
          <input
            type='text'
            onChange={e => setCircleRadiusToAdd(e.target.value)}
            value={circleRadiusToAdd}
          />
          <span>(Nm)</span><br/>
          <OkButton
            onClick={() => {
              dispatch(setCircleMeasurementToAdd({
                circleCoordinatesToAdd: circleCoordinatesToAdd,
                circleRadiusToAdd: circleRadiusToAdd
              }))
              setCircleCoordinatesToAdd([])
              setCircleRadiusToAdd('')
              dispatch(setMeasurementTypeToAdd(null))
              setMeasurementIsOpen(false)
            }}
          >
            OK
          </OkButton>
          <CancelButton
            onClick={() => {
              dispatch(setMeasurementTypeToAdd(null))
              setMeasurementIsOpen(false)
            }}>
            Annuler
          </CancelButton>
        </Body>
      </CircleRangeValue>
    </Wrapper>
  )
}

const CancelButton = styled.button`
  border: 1px solid ${COLORS.grayDarkerThree};
  width: 130px;
  padding: 5px 12px 5px 12px;
  margin: 15px 0 0 15px;
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  
  :disabled {
    border: 1px solid ${COLORS.grayDarker};
    color: ${COLORS.grayDarker};
  }
`

const OkButton = styled.button`
  background: ${COLORS.grayDarkerThree};
  width: 130px;
  padding: 5px 12px 5px 12px;
  margin: 15px 0 0 0;
  font-size: 13px;
  color: ${COLORS.grayBackground};
  
  :hover, :focus {
    background: ${COLORS.grayDarkerThree};
  }
`

const Body = styled.div`
  margin: 10px 15px;
  text-align: left;
  font-size: 13px;
  color: ${COLORS.textGray};
  
  p {
    margin: 0;
    font-size: 13px;
  }
  
  p:nth-of-type(2) {
    margin-top: 15px;
    font-size: 13px;
  }
  
  span {
    margin-left: 7px;
  }
  
  input {
    color: ${COLORS.grayDarkerThree};
    margin-top: 7px;
    background: ${COLORS.grayLighter};
    border: none;
    height: 27px;
    padding-left: 8px;
  }
  
  input:nth-of-type(2) {
    width: 32px;
  }
`

const Header = styled.div`
  background: ${COLORS.textGray};
  color: ${COLORS.grayBackground};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
  border-top-left-radius: ${props => props.isFirst ? '2px' : '0'};
  border-top-right-radius: ${props => props.isFirst ? '2px' : '0'};
`

const CircleRangeValue = styled.div`
  width: 306px;
  background: ${COLORS.background};
  margin-right: ${props => props.firstUpdate ? '-320px' : props.isOpen ? '45px' : '-320px'};
  opacity:  ${props => props.firstUpdate ? '0' : props.isOpen ? '1' : '0'};
  top: 165px;
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
`

const MeasurementItem = styled.div`
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
  position: relative;
  margin-left: 5px;
  float: right;
`

const MultiLineIcon = styled(MultiLineSVG)`
  width: 40px;
  height: 40px;
`

const CircleRangeIcon = styled(CircleRangeSVG)`
  width: 40px;
  height: 40px;
`

const Wrapper = styled.div`
  animation: ${props => props.isShowed ? 'measurement-opening' : 'measurement-closing'} 0.2s ease forwards;
  @keyframes measurement-opening {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes measurement-closing {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
  z-index: 1000;
`

const MeasurementOptions = styled.div`
  width: 175px;
  margin-right: -200px;
  top: 165px;
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  opacity: 0;
  animation: ${props => props.firstUpdate && !props.measurementBoxIsOpen ? '' : props.measurementBoxIsOpen ? 'measurement-box-opening' : 'measurement-box-closing'} 0.5s ease forwards;

  @keyframes measurement-box-opening {
    0%   { margin-right: -200px; opacity: 0;  }
    100% { margin-right: 45px; opacity: 1; }
  }

  @keyframes measurement-box-closing {
    0% { margin-right: 45px; opacity: 1; }
    100%   { margin-right: -200px; opacity: 0;  }
  }
`

const MeasurementWrapper = styled.button`
  position: absolute;
  display: inline-block;
  color: #05055E;
  background: ${props => props.isMeasuring ? COLORS.textGray : COLORS.grayDarkerThree};
  top: 157px;
  z-index: 99;
  right: 10px;
  height: 40px;
  width: 40px;
  border-radius: 2px;
  margin-top: 8px;
  
  animation: ${props => props.selectedVessel && !props.rightMenuIsOpen ? 'measurement-icon-closing' : 'measurement-icon-opening'} 0.3s ease forwards;
  
  @keyframes measurement-icon-opening {
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

  @keyframes measurement-icon-closing {
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

const MeasurementIcon = styled(MeasurementSVG)`
  width: 40px;
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

export default Measurement
