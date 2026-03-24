import { TransparentButton } from '@components/style'
import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { MapBox, MeasurementType } from '@features/Map/constants'
import { useClickOutsideWhenOpenedAndExecute } from '@hooks/useClickOutsideWhenOpenedAndExecute'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useEscapeFromKeyboardAndExecute } from '@hooks/useEscapeFromKeyboardAndExecute'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { setLeftMapBoxDisplayed } from 'domain/use_cases/setLeftMapBoxDisplayed'
import { useRef } from 'react'
import styled from 'styled-components'

import { CustomCircleRange } from './CustomCircleRange'
import { MapComponent } from '../../../commonStyles/MapComponent'
import { setMeasurementTypeToAdd } from '../../slice'

export function MeasurementMapButton() {
  const dispatch = useMainAppDispatch()
  const measurementTypeToAdd = useMainAppSelector(state => state.measurement.measurementTypeToAdd)
  const leftMapBoxOpened = useMainAppSelector(state => state.global.leftMapBoxOpened)
  const { isOpened: isMeasurementMenuOpen, isRendered: isMeasurementMenuRendered } = useDisplayMapBox(
    leftMapBoxOpened === MapBox.MEASUREMENT_MENU
  )
  const { isOpened: isMeasurementToolOpen, isRendered: isMeasurementToolRendered } = useDisplayMapBox(
    leftMapBoxOpened === MapBox.MEASUREMENT && measurementTypeToAdd === MeasurementType.CIRCLE_RANGE
  )

  const wrapperRef = useRef(null)

  useClickOutsideWhenOpenedAndExecute(wrapperRef, leftMapBoxOpened === MapBox.MEASUREMENT_MENU, () => {
    dispatch(setLeftMapBoxDisplayed(undefined))
  })
  useEscapeFromKeyboardAndExecute(() => {
    if (isMeasurementMenuOpen || isMeasurementToolOpen) {
      dispatch(setLeftMapBoxDisplayed(undefined))
    }
  })

  const makeMeasurement = nextMeasurementTypeToAdd => {
    dispatch(setLeftMapBoxDisplayed(MapBox.MEASUREMENT))
    dispatch(setMeasurementTypeToAdd(nextMeasurementTypeToAdd))
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
    if (isMeasurementMenuOpen) {
      dispatch(setLeftMapBoxDisplayed(undefined))

      return
    }

    dispatch(setLeftMapBoxDisplayed(MapBox.MEASUREMENT_MENU))
  }

  return (
    <Wrapper ref={wrapperRef}>
      {isMeasurementMenuRendered && (
        <MeasurementOptions $isOpen={isMeasurementMenuOpen}>
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
      )}
      {isMeasurementToolRendered && <CustomCircleRange isOpened={isMeasurementToolOpen} />}

      <MapToolButton
        data-cy="measurement"
        Icon={measurementIcon}
        isActive={isMeasurementMenuOpen || !!measurementTypeToAdd}
        isLeft
        onClick={openOrCloseMeasurementMenu}
        title="Mesurer une distance"
      />
    </Wrapper>
  )
}

const MeasurementItem = styled(TransparentButton)`
  background: ${p => p.theme.color.blueGray};
  border: none;

  &:hover {
    background: ${p => p.theme.color.blueYonder};
    border: none;
  }

  border-radius: 2px;
  padding: 6px;
  position: relative;
  right: 0;
  text-align: center;
  width: 40px;
  z-index: 99;
`

const Wrapper = styled.div`
  display: flex;
  position: relative;
`

const MeasurementOptions = styled(MapComponent)<{
  $isHidden?: boolean
  $isOpen: boolean
}>`
  border-radius: 2px;
  display: flex;
  gap: 8px;
  left: 50px;
  margin-left: ${p => (p.$isOpen ? '0' : '-200px')};
  opacity: ${p => (p.$isOpen ? '1' : '0')};
  position: absolute;
  transition: all 0.3s;
`
