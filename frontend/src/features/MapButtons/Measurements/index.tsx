import { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { CustomCircleRange } from './CustomCircleRange'
import { MapToolType, MeasurementType } from '../../../domain/entities/map/constants'
import { setMapToolOpened } from '../../../domain/shared_slices/Global'
import { setMeasurementTypeToAdd } from '../../../domain/shared_slices/Measurement'
import { useClickOutsideWhenOpenedAndExecute } from '../../../hooks/useClickOutsideWhenOpenedAndExecute'
import { useEscapeFromKeyboardAndExecute } from '../../../hooks/useEscapeFromKeyboardAndExecute'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { MapComponentStyle } from '../../commonStyles/MapComponent.style'
import { ReactComponent as MultiLineSVG } from '../../icons/standardized/Measure_broken_line.svg'
import { ReactComponent as CircleRangeSVG } from '../../icons/standardized/Measure_circle.svg'
import { ReactComponent as MeasurementSVG } from '../../icons/standardized/Measure_line.svg'
import { MapToolButton } from '../shared/MapToolButton'

export function MeasurementMapButton() {
  const dispatch = useMainAppDispatch()
  const measurementTypeToAdd = useMainAppSelector(state => state.measurement.measurementTypeToAdd)
  const { healthcheckTextWarning, mapToolOpened, rightMenuIsOpen } = useMainAppSelector(state => state.global)

  const isRightMenuShrinked = !rightMenuIsOpen
  const isOpen = useMemo(() => mapToolOpened === MapToolType.MEASUREMENT_MENU, [mapToolOpened])
  const isMeasurementToolOpen = useMemo(() => mapToolOpened === MapToolType.MEASUREMENT, [mapToolOpened])
  const wrapperRef = useRef(null)

  useClickOutsideWhenOpenedAndExecute(wrapperRef, isOpen, () => {
    dispatch(setMapToolOpened(undefined))
  })
  useEscapeFromKeyboardAndExecute(() => {
    dispatch(setMeasurementTypeToAdd(null))
    dispatch(setMapToolOpened(undefined))
  })

  useEffect(() => {
    if (!isOpen && !isMeasurementToolOpen) {
      dispatch(setMeasurementTypeToAdd(null))
    }
  }, [dispatch, isOpen, isMeasurementToolOpen])

  const makeMeasurement = nextMeasurementTypeToAdd => {
    dispatch(setMeasurementTypeToAdd(nextMeasurementTypeToAdd))
    dispatch(setMapToolOpened(MapToolType.MEASUREMENT))
  }

  const measurementIcon = useMemo(() => {
    switch (measurementTypeToAdd) {
      case MeasurementType.MULTILINE:
        return <MultiLineIcon />
      case MeasurementType.CIRCLE_RANGE:
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
      dispatch(setMapToolOpened(MapToolType.MEASUREMENT_MENU))
    }
  }, [dispatch, measurementTypeToAdd])

  return (
    <Wrapper ref={wrapperRef}>
      <MeasurementButton
        dataCy="measurement"
        isActive={isOpen || !!measurementTypeToAdd}
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
          onClick={() => makeMeasurement(MeasurementType.MULTILINE)}
          title={"Mesure d'une distance avec lignes brisées"}
        >
          <MultiLineIcon />
        </MeasurementItem>
        <MeasurementItem
          className=".map-menu"
          data-cy="measurement-circle-range"
          onClick={() => makeMeasurement(MeasurementType.CIRCLE_RANGE)}
          title={"Rayon d'action"}
        >
          <CircleRangeIcon />
        </MeasurementItem>
      </MeasurementOptions>
      <CustomCircleRange />
    </Wrapper>
  )
}

const MeasurementItem = styled.div`
  background: ${p => p.theme.color.blueGray};
  border-radius: 2px;
  cursor: pointer;
  display: inline-block;
  float: right;
  height: 32px;
  margin-left: 5px;
  padding: 0;
  padding-top: 8px;
  position: relative;
  right: 0;
  width: 40px;
  z-index: 99;
`

const MultiLineIcon = styled(MultiLineSVG)`
  height: 25px;
  width: 25px;

  path {
    fill: ${p => p.theme.color.gainsboro};
  }
`

const CircleRangeIcon = styled(CircleRangeSVG)`
  height: 25px;
  width: 25px;

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
  border-radius: 2px;
  display: inline-block;
  margin-right: ${p => (p.isOpen ? '45px' : '-200px')};
  opacity: ${p => (p.isOpen ? '1' : '0')};
  position: absolute;
  right: 10px;
  top: 249px;
  transition: all 0.5s;
  width: 175px;
  z-index: 1000;
`

const MeasurementButton = styled(MapToolButton)``

const MeasurementIcon = styled(MeasurementSVG)<{
  $isRightMenuShrinked: boolean
}>`
  height: 25px;
  opacity: ${p => (p.$isRightMenuShrinked ? '0' : '1')};
  transition: all 0.2s;
  width: 25px;

  path:first-of-type {
    fill: ${p => p.theme.color.gainsboro};
  }
`
