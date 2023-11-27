import { Icon } from '@mtes-mct/monitor-ui'
import { useCallback, useRef } from 'react'
import styled from 'styled-components'

import { MapToolButton } from './shared/MapToolButton'
import { displayedComponentActions } from '../../domain/shared_slices/DisplayedComponent'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

export function ControlUnitListDialogButton() {
  const wrapperRef = useRef(null)

  const dispatch = useMainAppDispatch()
  // const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)
  const isControlUnitDialogDisplayed = useMainAppSelector(
    state => state.displayedComponent.isControlUnitDialogDisplayed
  )
  const isControlUnitListDialogDisplayed = useMainAppSelector(
    state => state.displayedComponent.isControlUnitListDialogDisplayed
  )

  const toggle = useCallback(() => {
    const willBeControlUnitListDialogDisplayed = !isControlUnitListDialogDisplayed
    const willBeControlUnitListgDisplayed = isControlUnitDialogDisplayed && !willBeControlUnitListDialogDisplayed

    dispatch(
      displayedComponentActions.setDisplayedComponents({
        isControlUnitDialogDisplayed: willBeControlUnitListgDisplayed,
        isControlUnitListDialogDisplayed: willBeControlUnitListDialogDisplayed
      })
    )
  }, [dispatch, isControlUnitDialogDisplayed, isControlUnitListDialogDisplayed])

  return (
    <Wrapper ref={wrapperRef} $isActive={isControlUnitListDialogDisplayed} $isRightMenuShrinked={!rightMenuIsOpen}>
      <MapToolButton
        isActive={isControlUnitListDialogDisplayed}
        onClick={toggle}
        style={{ top: 236 }}
        title="Liste des unités de contrôle"
      >
        <Icon.ControlUnit size={28} />
      </MapToolButton>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $isActive: boolean
  // $isLeftButton: boolean
  $isRightMenuShrinked: boolean
}>`
  transition: all 0.2s;
  z-index: 1000;

  > button {
    color: ${p => p.theme.color.white};
    background-color: ${p => (p.$isActive ? p.theme.color.blueGray : p.theme.color.charcoal)};
  }
`
