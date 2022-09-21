import { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { MapTool, MeasurementTypes } from '../../../../domain/entities/map'
import { setMapToolOpened } from '../../../../domain/shared_slices/Global'
import {
  resetCircleMeasurementInDrawing,
  setCircleMeasurementToAdd,
  setMeasurementTypeToAdd
} from '../../../../domain/shared_slices/Measurement'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { useClickOutsideWhenOpened } from '../../../../hooks/useClickOutsideWhenOpened'
import { useEscapeFromKeyboard } from '../../../../hooks/useEscapeFromKeyboard'
import { MapComponentStyle } from '../../../commonStyles/MapComponent.style'
import { ReactComponent as MultiLineSVG } from '../../../icons/standardized/Measure_broken_line.svg'
import { ReactComponent as CircleRangeSVG } from '../../../icons/standardized/Measure_circle.svg'
import { ReactComponent as MeasurementSVG } from '../../../icons/standardized/Measure_line.svg'
import { MapToolButton } from '../MapToolButton'
import CustomCircleRange from './CustomCircleRange'

export function MeasurementMapButton() {
  const dispatch = useAppDispatch()
  const measurementTypeToAdd = useAppSelector(state => state.measurement.measurementTypeToAdd)
  const { healthcheckTextWarning, mapToolOpened, rightMenuIsOpen } = useAppSelector(state => state.global)

  const isRightMenuShrinked = !rightMenuIsOpen
  const isOpen = useMemo(() => mapToolOpened === MapTool.MEASUREMENT_MENU, [mapToolOpened])
  const isMeasurementToolOpen = useMemo(() => mapToolOpened === MapTool.MEASUREMENT, [mapToolOpened])
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, isOpen)
  const escapeFromKeyboard = useEscapeFromKeyboard()

  useEffect(() => {
    if (clickedOutsideComponent && isOpen) {
      dispatch(setMapToolOpened(undefined))
    }
  }, [dispatch, clickedOutsideComponent, isOpen])

  useEffect(() => {
    if (!isOpen && !isMeasurementToolOpen) {
      dispatch(setMeasurementTypeToAdd(null))
    }
  }, [dispatch, isOpen, isMeasurementToolOpen])

  useEffect(() => {
    if (escapeFromKeyboard) {
      dispatch(setMeasurementTypeToAdd(null))
      dispatch(setMapToolOpened(undefined))
    }
  }, [dispatch, escapeFromKeyboard])

  const makeMeasurement = nextMeasurementTypeToAdd => {
    dispatch(setMeasurementTypeToAdd(nextMeasurementTypeToAdd))
    dispatch(setMapToolOpened(MapTool.MEASUREMENT))
  }

  const measurementIcon = useMemo(() => {
    switch (measurementTypeToAdd) {
      case MeasurementTypes.MULTILINE:
        return <MultiLineIcon />
      case MeasurementTypes.CIRCLE_RANGE:
        return <CircleRangeIcon />
      default:
        return <MeasurementIcon $isRightMenuShrinked={isRightMenuShrinked} />
    }
  }, [measurementTypeToAdd, isRightMenuShrinked])

  const openOrCloseMeasurementMenu = useCallback(() => {
    if (measurementTypeToAdd) {
      dispatch(setMeasurementTypeToAdd(null))
      dispatch(setMapToolOpened(undefined))
    } else {
      dispatch(setMapToolOpened(MapTool.MEASUREMENT_MENU))
    }
  }, [dispatch, measurementTypeToAdd])

  const addCustomCircleRange = useCallback(
    (circleCoordinatesToAdd, circleRadiusToAdd) => {
      dispatch(
        setCircleMeasurementToAdd({
          circleCoordinatesToAdd,
          circleRadiusToAdd
        })
      )
      dispatch(setMeasurementTypeToAdd(null))
      dispatch(setMapToolOpened(undefined))
    },
    [dispatch]
  )

  const cancelAddCircleRange = useCallback(() => {
    dispatch(setMeasurementTypeToAdd(null))
    dispatch(resetCircleMeasurementInDrawing())
    dispatch(setMapToolOpened(undefined))
  }, [dispatch])

  return (
    <Wrapper ref={wrapperRef}>
      <MeasurementButton
        dataCy="measurement"
        isOpen={isOpen || !!measurementTypeToAdd}
        onClick={openOrCloseMeasurementMenu}
        style={{ top: 249 }}
        title="Mesurer une distance"
      >
        {measurementIcon}
      </MeasurementButton>
      <MeasurementOptions healthcheckTextWarning={!!healthcheckTextWarning} isOpen={isOpen}>
        <MeasurementItem
          className=".map-menu"
          data-cy="measurement-multiline"
          onClick={() => makeMeasurement(MeasurementTypes.MULTILINE)}
          title={"Mesure d'une distance avec lignes brisées"}
        >
          <MultiLineIcon />
        </MeasurementItem>
        <MeasurementItem
          className=".map-menu"
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
  height: 32px;
  width: 40px;
  border-radius: 2px;
  padding-top: 8px;
  cursor: pointer;
  position: relative;
  margin-left: 5px;
  float: right;
`

const MultiLineIcon = styled(MultiLineSVG)`
  width: 25px;
  height: 25px;

  path {
    fill: ${p => p.theme.color.gainsboro};
  }
`

const CircleRangeIcon = styled(CircleRangeSVG)`
  width: 25px;
  height: 25px;

  path {
    fill: ${p => p.theme.color.gainsboro};
  }
`

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`

const MeasurementOptions = styled(MapComponentStyle)<{
  healthcheckTextWarning: boolean
  isHidden?: boolean
  isOpen: boolean
}>`
  width: 175px;
  margin-right: ${p => (p.isOpen ? '45px' : '-200px')};
  opacity: ${p => (p.isOpen ? '1' : '0')};
  top: 249px;
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
  z-index: 999;
`

const MeasurementButton = styled(MapToolButton)``

const MeasurementIcon = styled(MeasurementSVG)<{
  $isRightMenuShrinked: boolean
}>`
  width: 25px;
  height: 25px;
  opacity: ${p => (p.$isRightMenuShrinked ? '0' : '1')};
  transition: all 0.2s;
  path:first-of-type {
    fill: ${p => p.theme.color.gainsboro};
  }
`
