import { MapBox } from '@features/Map/constants'
import { useClickOutsideWhenOpenedAndExecute } from '@hooks/useClickOutsideWhenOpenedAndExecute'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import { useRef } from 'react'
import styled from 'styled-components'

import { EditVesselLabels } from './EditVesselLabels'
import { displayedComponentActions } from '../../../../../domain/shared_slices/DisplayedComponent'
import { setRightMapBoxOpened } from '../../../../../domain/shared_slices/Global'
import { MapToolButton } from '../shared/MapToolButton'

export function VesselLabelsMapButton() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const isOpen = rightMapBoxOpened === MapBox.VESSEL_LABELS
  const wrapperRef = useRef(null)

  useClickOutsideWhenOpenedAndExecute(wrapperRef, isOpen, () => {
    dispatch(setRightMapBoxOpened(undefined))
  })

  const openOrCloseVesselLabels = () => {
    if (!isOpen) {
      dispatch(setRightMapBoxOpened(MapBox.VESSEL_LABELS))
      dispatch(displayedComponentActions.setDisplayedComponents({ isControlUnitListDialogDisplayed: false }))

      return
    }

    dispatch(setRightMapBoxOpened(undefined))
  }

  return (
    <Wrapper ref={wrapperRef}>
      <MapToolButton
        data-cy="vessel-labels"
        Icon={Icon.Tag}
        isActive={isOpen}
        onClick={openOrCloseVesselLabels}
        style={{ top: 220 }}
        title="Affichage des labels"
      />
      <EditVesselLabels />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`
