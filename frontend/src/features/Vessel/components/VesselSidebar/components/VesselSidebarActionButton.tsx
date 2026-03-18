import { MapButton } from '@features/Map/components/MapButtons/MapButton'
import { REPORTING_MAP_FORM_WIDTH } from '@features/Reporting/components/IUUReportingMapForm'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

import type { HTMLProps, ReactNode } from 'react'

type VesselSidebarActionButtonProps = Omit<HTMLProps<HTMLButtonElement>, 'children' | 'ref'> & {
  $backgroundColor?: string
  $isSidebarOpen: boolean
  $top: number
  children: ReactNode
  isHidden?: boolean
}
export function VesselSidebarActionButton({
  $backgroundColor,
  $isSidebarOpen,
  $top,
  children,
  ...rest
}: VesselSidebarActionButtonProps) {
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)
  const isReportingMapFormDisplayed = useMainAppSelector(state => state.displayedComponent.isReportingMapFormDisplayed)

  return (
    <StyledButton
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...($backgroundColor !== undefined ? { $backgroundColor } : {})}
      $isReportingOpen={isReportingMapFormDisplayed}
      $isRightMenuOpen={rightMenuIsOpen}
      $isSidebarOpen={$isSidebarOpen}
      $top={$top}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      {children}
    </StyledButton>
  )
}

const StyledButton = styled(MapButton)<{
  $backgroundColor?: string
  $isReportingOpen: boolean
  $isRightMenuOpen: boolean
  $isSidebarOpen: boolean
  $top: number
}>`
  top: ${p => p.$top}px;
  height: 30px;
  width: 30px;
  background: ${p => p.$backgroundColor ?? p.theme.color.charcoal};
  position: absolute;
  margin-right: ${p => (p.$isSidebarOpen ? 505 : -45)}px;
  opacity: ${p => (p.$isSidebarOpen ? 1 : 0)};
  cursor: pointer;
  border-radius: 1px;
  right: ${p => {
    const base = p.$isRightMenuOpen && p.$isSidebarOpen ? 55 : 10

    return base + (p.$isReportingOpen ? REPORTING_MAP_FORM_WIDTH : 0)
  }}px;
  transition:
    all 0.5s,
    right 0.3s;

  &:hover,
  &:focus {
    background: ${p => p.$backgroundColor ?? p.theme.color.charcoal};
  }
`
