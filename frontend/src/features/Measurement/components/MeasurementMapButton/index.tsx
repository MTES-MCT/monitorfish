import { TransparentButton } from '@components/style'
import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { MapBox, MeasurementType } from '@features/Map/constants'
import { useClickOutsideWhenOpenedAndExecute } from '@hooks/useClickOutsideWhenOpenedAndExecute'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useEscapeFromKeyboardAndExecute } from '@hooks/useEscapeFromKeyboardAndExecute'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { setRightMapBoxDisplayed } from 'domain/use_cases/setRightMapBoxDisplayed'
import { useRef } from 'react'
import styled from 'styled-components'

import { CustomCircleRange } from './CustomCircleRange'
import { displayedComponentActions } from '../../../../domain/shared_slices/DisplayedComponent'
import { MapComponent } from '../../../commonStyles/MapComponent'
import { setMeasurementTypeToAdd } from '../../slice'

export function MeasurementMapButton() {
  const dispatch = useMainAppDispatch()
  const measurementTypeToAdd = useMainAppSelector(state => state.measurement.measurementTypeToAdd)
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const { isOpened: isMeasurementMenuOpen, isRendered: isMeasurementMenuRendered } = useDisplayMapBox(
    rightMapBoxOpened === MapBox.MEASUREMENT_MENU
  )
  const { isOpened: isMeasurementToolOpen, isRendered: isMeasurementToolRendered } = useDisplayMapBox(
    rightMapBoxOpened === MapBox.MEASUREMENT && measurementTypeToAdd === MeasurementType.CIRCLE_RANGE
  )

  const wrapperRef = useRef(null)

  useClickOutsideWhenOpenedAndExecute(wrapperRef, rightMapBoxOpened === MapBox.MEASUREMENT_MENU, () => {
    dispatch(setRightMapBoxDisplayed(undefined))
  })
  useEscapeFromKeyboardAndExecute(() => {
    if (isMeasurementMenuOpen || isMeasurementToolOpen) {
      dispatch(setRightMapBoxDisplayed(undefined))
    }
  })

  const makeMeasurement = nextMeasurementTypeToAdd => {
    dispatch(setRightMapBoxDisplayed(MapBox.MEASUREMENT))
    dispatch(displayedComponentActions.setDisplayedComponents({ isControlUnitListDialogDisplayed: false }))
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
      dispatch(setRightMapBoxDisplayed(undefined))

      return
    }

    dispatch(setRightMapBoxDisplayed(MapBox.MEASUREMENT_MENU))
    dispatch(displayedComponentActions.setDisplayedComponents({ isControlUnitListDialogDisplayed: false }))
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
        onClick={openOrCloseMeasurementMenu}
        title="Mesurer une distance"
      />
    </Wrapper>
  )
}

const MeasurementItem = styled(TransparentButton)`
  background: ${p => p.theme.color.blueGray};

  &:hover {
    background: ${p => p.theme.color.blueGray};
    border: 1px solid transparent;
  }

  border-radius: 2px;
  padding: 8px 0 0;
  position: relative;
  right: 0;
  text-align: center;
  width: 40px;
  z-index: 99;
`

const Wrapper = styled.div`
  transition: all 0.2s;
`

const MeasurementOptions = styled(MapComponent)<{
  $isHidden?: boolean
  $isOpen: boolean
}>`
  border-radius: 2px;
  display: flex;
  gap: 8px;
  margin-right: ${p => (p.$isOpen ? '50px' : '-250px')};
  opacity: ${p => (p.$isOpen ? '1' : '0')};
  position: absolute;
  right: 10px;
  transition: all 0.3s;
`
