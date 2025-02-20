import { MapBox, MeasurementType } from '@features/Map/constants'
import { useClickOutsideWhenOpenedAndExecute } from '@hooks/useClickOutsideWhenOpenedAndExecute'
import { useEscapeFromKeyboardAndExecute } from '@hooks/useEscapeFromKeyboardAndExecute'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { CustomCircleRange } from './CustomCircleRange'
import { setRightMapBoxOpened } from '../../../../domain/shared_slices/Global'
import { MapComponent } from '../../../commonStyles/MapComponent'
import { MapToolButton } from '../../../MainWindow/components/MapButtons/shared/MapToolButton'
import { setMeasurementTypeToAdd } from '../../slice'

export function MeasurementMapButton() {
  const dispatch = useMainAppDispatch()
  const measurementTypeToAdd = useMainAppSelector(state => state.measurement.measurementTypeToAdd)
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const isOpen = rightMapBoxOpened === MapBox.MEASUREMENT_MENU
  const isMeasurementToolOpen = rightMapBoxOpened === MapBox.MEASUREMENT
  const wrapperRef = useRef(null)

  useClickOutsideWhenOpenedAndExecute(wrapperRef, isOpen, () => {
    dispatch(setRightMapBoxOpened(undefined))
  })
  useEscapeFromKeyboardAndExecute(() => {
    dispatch(setMeasurementTypeToAdd(null))
    dispatch(setRightMapBoxOpened(undefined))
  })

  useEffect(() => {
    if (!isOpen && !isMeasurementToolOpen) {
      dispatch(setMeasurementTypeToAdd(null))
    }
  }, [dispatch, isOpen, isMeasurementToolOpen])

  const makeMeasurement = nextMeasurementTypeToAdd => {
    dispatch(setMeasurementTypeToAdd(nextMeasurementTypeToAdd))
    dispatch(setRightMapBoxOpened(MapBox.MEASUREMENT))
  }

  const measurementIcon = (function () {
    switch (measurementTypeToAdd) {
      case MeasurementType.MULTILINE:
        return Icon.MeasureBrokenLine
      case MeasurementType.CIRCLE_RANGE:
        return Icon.MeasureCircle
      default:
        return Icon.MeasureLine
    }
  })()

  const openOrCloseMeasurementMenu = () => {
    if (measurementTypeToAdd) {
      dispatch(setMeasurementTypeToAdd(null))
      dispatch(setRightMapBoxOpened(undefined))

      return
    }

    dispatch(setRightMapBoxOpened(MapBox.MEASUREMENT_MENU))
  }

  return (
    <Wrapper ref={wrapperRef}>
      <MapToolButton
        data-cy="measurement"
        Icon={measurementIcon}
        isActive={isOpen || !!measurementTypeToAdd}
        onClick={openOrCloseMeasurementMenu}
        style={{ top: 316 }}
        title="Mesurer une distance"
      />
      <MeasurementOptions $isOpen={isOpen}>
        <MeasurementItem
          className=".map-menu"
          data-cy="measurement-multiline"
          onClick={() => makeMeasurement(MeasurementType.MULTILINE)}
          title="Mesure d'une distance avec lignes brisées"
        >
          <Icon.MeasureBrokenLine color={THEME.color.gainsboro} size={25} />
        </MeasurementItem>
        <MeasurementItem
          className=".map-menu"
          data-cy="measurement-circle-range"
          onClick={() => makeMeasurement(MeasurementType.CIRCLE_RANGE)}
          title="Rayon d'action"
        >
          <Icon.MeasureCircle color={THEME.color.gainsboro} size={25} />
        </MeasurementItem>
      </MeasurementOptions>
      <CustomCircleRange />
    </Wrapper>
  )
}

// TODO `display: inline-block;` is ignored here because of the `float: right;`.
const MeasurementItem = styled.div`
  background: ${p => p.theme.color.blueGray};
  border-radius: 2px;
  cursor: pointer;
  display: inline-block;
  height: 32px;
  margin-left: 5px;
  padding: 0;
  padding-top: 8px;
  position: relative;
  right: 0;
  text-align: center;
  width: 40px;
  z-index: 99;
`

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`

const MeasurementOptions = styled(MapComponent)<{
  $isHidden?: boolean
  $isOpen: boolean
}>`
  border-radius: 2px;
  display: inline-block;
  margin-right: ${p => (p.$isOpen ? '0px' : '-200px')};
  opacity: ${p => (p.$isOpen ? '1' : '0')};
  position: absolute;
  right: 10px;
  top: 316px;
  transition: all 0.5s;
  width: 135px;
  z-index: 1000;
`
