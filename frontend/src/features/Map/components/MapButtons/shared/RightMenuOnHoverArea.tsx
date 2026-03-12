import { useClickOutsideWhenOpened } from '@hooks/useClickOutsideWhenOpened'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { contractRightMenu, expandRightMenu } from '../../../../../domain/shared_slices/Global'

export function RightMenuOnHoverArea() {
  const dispatch = useMainAppDispatch()
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)
  const isControlUnitListDialogDisplayed = useMainAppSelector(
    state => state.displayedComponent.isControlUnitListDialogDisplayed
  )
  const isReportingMapFormDisplayed = useMainAppSelector(state => state.displayedComponent.isReportingMapFormDisplayed)

  const areaRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideWhenOpened(areaRef, !!selectedVessel)
  const hasSidebarOpened = !!selectedVessel || !!isReportingMapFormDisplayed
  const shouldExpand = !hasSidebarOpened || !!rightMapBoxOpened || isControlUnitListDialogDisplayed

  useEffect(() => {
    if (shouldExpand) {
      dispatch(expandRightMenu())

      return
    }

    dispatch(contractRightMenu())
  }, [
    dispatch,
    clickedOutsideComponent,
    rightMapBoxOpened,
    isControlUnitListDialogDisplayed,
    selectedVessel,
    shouldExpand
  ])

  return (
    hasSidebarOpened && (
      <Area ref={areaRef} $isExpanded={rightMenuIsOpen} onMouseEnter={() => dispatch(expandRightMenu())} />
    )
  )
}

const Area = styled.div<{ $isExpanded: boolean | undefined }>`
  height: 100%;
  right: 0;
  width: ${p => (p.$isExpanded ? 60 : 20)}px;
  opacity: 0;
  position: absolute;
  top: 0;
  z-index: ${p => (p.$isExpanded ? -1 : 2)};
`
