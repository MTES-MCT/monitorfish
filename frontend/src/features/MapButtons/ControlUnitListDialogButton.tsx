import { Icon, IconButton } from '@mtes-mct/monitor-ui'
import { useCallback, useRef } from 'react'
import styled from 'styled-components'

import { displayedComponentActions } from '../../domain/shared_slices/DisplayedComponent'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

// TODO DRY that with `frontend/src/features/MapButtons/shared/MapToolButton.tsx` when we'll migrate to using MUI-only components.
// Or u
export function ControlUnitListDialogButton() {
  const wrapperRef = useRef(null)

  const dispatch = useMainAppDispatch()
  // const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)
  const isControlUnitListDialogDisplayed = useMainAppSelector(
    state => state.displayedComponent.isControlUnitListDialogDisplayed
  )

  const toggle = useCallback(() => {
    dispatch(
      displayedComponentActions.setDisplayedComponents({
        isControlUnitListDialogDisplayed: !isControlUnitListDialogDisplayed
      })
    )
  }, [dispatch, isControlUnitListDialogDisplayed])

  return (
    <Wrapper ref={wrapperRef} $isActive={isControlUnitListDialogDisplayed} $isRightMenuShrinked={!rightMenuIsOpen}>
      <IconButton
        data-cy="ControlUnitListDialogButton"
        Icon={Icon.ControlUnit}
        iconSize={28}
        onClick={toggle}
        title="Affichage de la liste des unités"
      />
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $isActive: boolean
  // $isLeftButton: boolean
  $isRightMenuShrinked: boolean
}>`
  /* right: 10px; */
  transition: all 0.2s;
  z-index: 1000;

  .Element-IconButton {
    /* TODO Add isActive prop in MUI? */
    background-color: ${p => (p.$isActive ? p.theme.color.blueGray : p.theme.color.charcoal)};
    position: absolute;
    right: ${p => (p.$isRightMenuShrinked ? 0 : 10)}px;
    top: 383px;
    width: ${p => (p.$isRightMenuShrinked ? '5px' : '40px')};
  }
`
