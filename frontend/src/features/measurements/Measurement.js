import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { MeasurementTypes } from '../../domain/entities/map'
import { expandRightMenu } from '../../domain/shared_slices/Global'
import {
  resetCircleMeasurementInDrawing,
  setCircleMeasurementToAdd,
  setMeasurementTypeToAdd,
} from '../../domain/shared_slices/Measurement'
import unselectVessel from '../../domain/use_cases/vessel/unselectVessel'
import { useClickOutsideWhenOpened } from '../../hooks/useClickOutsideWhenOpened'
import { useEscapeFromKeyboard } from '../../hooks/useEscapeFromKeyboard'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { ReactComponent as MeasurementSVG } from '../icons/Mesure.svg'
import { ReactComponent as MultiLineSVG } from '../icons/Mesure_ligne_brisee.svg'
import { ReactComponent as CircleRangeSVG } from '../icons/Mesure_rayon_action.svg'
import CustomCircleRange from './CustomCircleRange'

function Measurement() {
  const dispatch = useDispatch()
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)
  const { measurementTypeToAdd } = useSelector(state => state.measurement)
  const { healthcheckTextWarning, previewFilteredVesselsMode } = useSelector(state => state.global)

  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, isOpen)
  const escapeFromKeyboard = useEscapeFromKeyboard()

  useEffect(() => {
    if (clickedOutsideComponent) {
      setIsOpen(false)
    }
  }, [clickedOutsideComponent])

  useEffect(() => {
    if (escapeFromKeyboard) {
      dispatch(setMeasurementTypeToAdd(null))
      setIsOpen(false)
    }
  }, [escapeFromKeyboard])

  const makeMeasurement = measurementTypeToAdd => {
    dispatch(setMeasurementTypeToAdd(measurementTypeToAdd))
    setIsOpen(false)
  }

  const measurementIcon = useMemo(() => {
    switch (measurementTypeToAdd) {
      case MeasurementTypes.MULTILINE:
        return <MultiLineIcon />
      case MeasurementTypes.CIRCLE_RANGE:
        return <CircleRangeIcon />
      default:
        return <MeasurementIcon $rightMenuIsOpen={rightMenuIsOpen} $selectedVessel={selectedVessel} />
    }
  }, [measurementTypeToAdd])

  function openOrCloseMeasurement() {
    if (measurementTypeToAdd) {
      dispatch(setMeasurementTypeToAdd(null))
      setIsOpen(false)
    } else {
      setIsOpen(!isOpen)
      dispatch(unselectVessel())
    }
  }

  function addCustomCircleRange(circleCoordinatesToAdd, circleRadiusToAdd) {
    dispatch(
      setCircleMeasurementToAdd({
        circleCoordinatesToAdd,
        circleRadiusToAdd,
      }),
    )
    dispatch(setMeasurementTypeToAdd(null))
    setIsOpen(false)
  }

  function cancelAddCircleRange() {
    dispatch(setMeasurementTypeToAdd(null))
    dispatch(resetCircleMeasurementInDrawing())
    setIsOpen(false)
  }

  return (
    <Wrapper ref={wrapperRef}>
      <MeasurementWrapper
        data-cy="measurement"
        healthcheckTextWarning={healthcheckTextWarning}
        isHidden={previewFilteredVesselsMode}
        isOpen={isOpen || measurementTypeToAdd}
        onClick={openOrCloseMeasurement}
        onMouseEnter={() => dispatch(expandRightMenu())}
        rightMenuIsOpen={rightMenuIsOpen}
        selectedVessel={selectedVessel}
        title="Mesurer une distance"
      >
        {measurementIcon}
      </MeasurementWrapper>
      <MeasurementOptions healthcheckTextWarning={healthcheckTextWarning} isOpen={isOpen}>
        <MeasurementItem
          data-cy="measurement-multiline"
          onClick={() => makeMeasurement(MeasurementTypes.MULTILINE)}
          title={"Mesure d'une distance avec lignes brisées"}
        >
          <MultiLineIcon />
        </MeasurementItem>
        <MeasurementItem
          data-cy="measurement-circle-range"
          onClick={() => makeMeasurement(MeasurementTypes.CIRCLE_RANGE)}
          title={"Rayon d'action"}
        >
          <CircleRangeIcon />
        </MeasurementItem>
      </MeasurementOptions>
      <CustomCircleRange onAddCustomCircleRange={addCustomCircleRange} onCancelAddCircleRange={cancelAddCircleRange} />
    </Wrapper>
  )
}

const MeasurementItem = styled.div`
  display: inline-block;
  color: ${COLORS.blue};
  background: ${COLORS.shadowBlue};
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
  transition: all 0.2s;
  z-index: 1000;
`

const MeasurementOptions = styled(MapComponentStyle)`
  width: 175px;
  margin-right: ${props => (props.isOpen ? '45px' : '-200px')};
  opacity: ${props => (props.isOpen ? '1' : '0')};
  top: 249px;
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
`

const MeasurementWrapper = styled(MapButtonStyle)`
  position: absolute;
  display: inline-block;
  color: ${COLORS.blue};
  top: 249px;
  z-index: 99;
  height: 40px;
  width: ${props => (props.selectedVessel && !props.rightMenuIsOpen ? '5px' : '40px')};
  border-radius: ${props => (props.selectedVessel && !props.rightMenuIsOpen ? '1px' : '2px')};
  right: ${props => (props.selectedVessel && !props.rightMenuIsOpen ? '0' : '10px')};
  transition: all 0.3s;
  background: ${props => (props.isOpen ? COLORS.shadowBlue : COLORS.charcoal)};

  :hover,
  :focus {
    background: ${props => (props.isOpen ? COLORS.shadowBlue : COLORS.charcoal)};
  }
`

const MeasurementIcon = styled(MeasurementSVG)`
  width: 40px;
  opacity: ${props => (props.$selectedVessel && !props.$rightMenuIsOpen ? '0' : '1')};
  transition: all 0.2s;
`

export default Measurement
