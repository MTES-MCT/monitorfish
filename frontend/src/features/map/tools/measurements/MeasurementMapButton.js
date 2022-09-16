import { useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as MeasurementSVG } from '../../../icons/Mesure.svg'
import { ReactComponent as MultiLineSVG } from '../../../icons/Mesure_ligne_brisee.svg'
import { ReactComponent as CircleRangeSVG } from '../../../icons/Mesure_rayon_action.svg'
import { COLORS } from '../../../../constants/constants'
import {
  resetCircleMeasurementInDrawing,
  setCircleMeasurementToAdd,
  setMeasurementTypeToAdd
} from '../../../../domain/shared_slices/Measurement'
import { expandRightMenu, setMapToolOpened } from '../../../../domain/shared_slices/Global'
import { MapTool, MeasurementTypes } from '../../../../domain/entities/map'
import CustomCircleRange from './CustomCircleRange'
import { MapComponentStyle } from '../../../commonStyles/MapComponent.style'
import { MapButtonStyle } from '../../../commonStyles/MapButton.style'
import { useEscapeFromKeyboard } from '../../../../hooks/useEscapeFromKeyboard'
import { useClickOutsideWhenOpened } from '../../../../hooks/useClickOutsideWhenOpened'
import { MapToolButton } from '../MapToolButton'

const MeasurementMapButton = () => {
  const dispatch = useDispatch()
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const measurementTypeToAdd = useSelector(state => state.measurement.measurementTypeToAdd)
  const {
    healthcheckTextWarning,
    previewFilteredVesselsMode,
    mapToolOpened,
    rightMenuIsOpen
  } = useSelector(state => state.global)

  const isOpen = useMemo(() => mapToolOpened === MapTool.MEASUREMENT_MENU, [mapToolOpened])
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, isOpen)
  const escapeFromKeyboard = useEscapeFromKeyboard()

  useEffect(() => {
    if (clickedOutsideComponent) {
      dispatch(setMapToolOpened(undefined))
    }
  }, [clickedOutsideComponent])

  useEffect(() => {
    if (escapeFromKeyboard) {
      dispatch(setMeasurementTypeToAdd(null))
      dispatch(setMapToolOpened(undefined))
    }
  }, [escapeFromKeyboard])

  const makeMeasurement = measurementTypeToAdd => {
    dispatch(setMeasurementTypeToAdd(measurementTypeToAdd))
    dispatch(setMapToolOpened(MapTool.MEASUREMENT))
  }

  const measurementIcon = useMemo(() => {
    switch (measurementTypeToAdd) {
      case MeasurementTypes.MULTILINE:
        return <MultiLineIcon/>
      case MeasurementTypes.CIRCLE_RANGE:
        return <CircleRangeIcon/>
      default:
        return <MeasurementIcon
          $rightMenuIsOpen={rightMenuIsOpen}
          $selectedVessel={selectedVessel}
        />
    }
  }, [measurementTypeToAdd, rightMenuIsOpen, selectedVessel])

  function openOrCloseMeasurementMenu () {
    if (measurementTypeToAdd) {
      dispatch(setMeasurementTypeToAdd(null))
      dispatch(setMapToolOpened(undefined))
    } else {
      dispatch(setMapToolOpened(MapTool.MEASUREMENT_MENU))
    }
  }

  function addCustomCircleRange (circleCoordinatesToAdd, circleRadiusToAdd) {
    dispatch(setCircleMeasurementToAdd({
      circleCoordinatesToAdd: circleCoordinatesToAdd,
      circleRadiusToAdd: circleRadiusToAdd
    }))
    dispatch(setMeasurementTypeToAdd(null))
    dispatch(setMapToolOpened(undefined))
  }

  function cancelAddCircleRange () {
    dispatch(setMeasurementTypeToAdd(null))
    dispatch(resetCircleMeasurementInDrawing())
    dispatch(setMapToolOpened(undefined))
  }

  return (
    <Wrapper ref={wrapperRef}>
      <MeasurementButton
        data-cy={'measurement'}
        isHidden={previewFilteredVesselsMode}
        healthcheckTextWarning={healthcheckTextWarning}
        isOpen={isOpen || measurementTypeToAdd}
        rightMenuIsOpen={rightMenuIsOpen}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title={'Mesurer une distance'}
        onClick={openOrCloseMeasurementMenu}>
        {measurementIcon}
      </MeasurementButton>
      <MeasurementOptions
        healthcheckTextWarning={healthcheckTextWarning}
        isOpen={isOpen}
      >
        <MeasurementItem
          className={'.map-menu'}
          data-cy={'measurement-multiline'}
          title={'Mesure d\'une distance avec lignes brisées'}
          onClick={() => makeMeasurement(MeasurementTypes.MULTILINE)}
        >
          <MultiLineIcon/>
        </MeasurementItem>
        <MeasurementItem
          className={'.map-menu'}
          data-cy={'measurement-circle-range'}
          title={'Rayon d\'action'}
          onClick={() => makeMeasurement(MeasurementTypes.CIRCLE_RANGE)}
        >
          <CircleRangeIcon/>
        </MeasurementItem>
      </MeasurementOptions>
      <CustomCircleRange
        onCancelAddCircleRange={cancelAddCircleRange}
        onAddCustomCircleRange={addCustomCircleRange}
      />
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
  margin-right: ${props => props.isOpen ? '45px' : '-200px'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  top: 249px;
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
  z-index: 999;
`

const MeasurementButton = styled(MapToolButton)`
  top: 249px;
`

const MeasurementIcon = styled(MeasurementSVG)`
  width: 40px;
  opacity: ${props => props.$selectedVessel && !props.$rightMenuIsOpen ? '0' : '1'};
  transition: all 0.2s;
`

export default MeasurementMapButton
