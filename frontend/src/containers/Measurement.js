import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as MeasurementSVG } from '../components/icons/Mesure.svg'
import { ReactComponent as MultiLineSVG } from '../components/icons/Mesure_ligne_brisee.svg'
import { ReactComponent as CircleRangeSVG } from '../components/icons/Mesure_rayon_action.svg'
import { COLORS } from '../constants/constants'
import { setCircleMeasurementToAdd, setMeasurementTypeToAdd } from '../domain/reducers/Map'
import { expandRightMenu } from '../domain/reducers/Global'
import unselectVessel from '../domain/use_cases/unselectVessel'
import { MeasurementTypes } from '../domain/entities/map'
import CustomCircleRange from '../components/measurements/CustomCircleRange'

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
    setIsShowed(!(temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length))
  }, [temporaryVesselsToHighLightOnMap])

  const escapeFromKeyboard = event => {
    const escapeKeyCode = 27
    if (event.keyCode === escapeKeyCode) {
      dispatch(setMeasurementTypeToAdd(null))
      setMeasurementIsOpen(false)
    }
  }

  const makeMeasurement = measurementType => {
    dispatch(setMeasurementTypeToAdd(measurementType))
    setMeasurementIsOpen(false)
  }

  const getMeasurementIcon = measurementType => {
    switch (measurementType) {
      case MeasurementTypes.MULTILINE: return <MultiLineIcon/>
      case MeasurementTypes.CIRCLE_RANGE: return <CircleRangeIcon/>
      default: return <MeasurementIcon rightMenuIsOpen={rightMenuIsOpen} selectedVessel={selectedVessel}/>
    }
  }

  function openOrCloseMeasurement () {
    if (measurementTypeToAdd) {
      dispatch(setMeasurementTypeToAdd(null))
      setMeasurementIsOpen(false)
    } else {
      setMeasurementIsOpen(!measurementIsOpen)
    }
  }

  function addCustomCircleRange () {
    dispatch(setCircleMeasurementToAdd({
      circleCoordinatesToAdd: circleCoordinatesToAdd,
      circleRadiusToAdd: circleRadiusToAdd
    }))
    setCircleCoordinatesToAdd([])
    setCircleRadiusToAdd('')
    dispatch(setMeasurementTypeToAdd(null))
    setMeasurementIsOpen(false)
  }

  function cancelAddCircleRange () {
    dispatch(setMeasurementTypeToAdd(null))
    setMeasurementIsOpen(false)
  }

  return (
    <Wrapper isShowed={isShowed} ref={wrapperRef}>
      <MeasurementWrapper
        isMeasuring={measurementTypeToAdd}
        rightMenuIsOpen={rightMenuIsOpen}
        selectedVessel={selectedVessel}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title={'Mesurer une distance'}
        onClick={openOrCloseMeasurement}>
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
      <CustomCircleRange
        firstUpdate={firstUpdate.current}
        measurementTypeToAdd={measurementTypeToAdd}
        circleCoordinatesToAdd={circleCoordinatesToAdd}
        circleRadiusToAdd={circleRadiusToAdd}
        setCircleCoordinatesToAdd={setCircleCoordinatesToAdd}
        setCircleRadiusToAdd={setCircleRadiusToAdd}
        cancelAddCircleRange={cancelAddCircleRange}
        addCustomCircleRange={addCustomCircleRange}/>
    </Wrapper>
  )
}

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
  opacity: ${props => props.isShowed ? '1' : '0'};
  transition: all 0.2s;
  z-index: 1000;
`

const MeasurementOptions = styled.div`
  width: 175px;
  margin-right: ${props => props.measurementBoxIsOpen ? '45px' : '-200px'};
  opacity: ${props => props.measurementBoxIsOpen ? '1' : '0'};
  top: 207px;
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;

`

const MeasurementWrapper = styled.button`
  position: absolute;
  display: inline-block;
  color: #05055E;
  background: ${props => props.isMeasuring ? COLORS.textGray : COLORS.grayDarkerThree};
  top: 199px;
  z-index: 99;
  margin-top: 8px;
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

export default Measurement
