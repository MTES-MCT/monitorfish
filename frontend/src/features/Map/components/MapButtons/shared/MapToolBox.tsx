import { MapComponent } from '@features/commonStyles/MapComponent'
import { REPORTING_MAP_FORM_WIDTH } from '@features/Reporting/components/IUUReportingMapForm/constants'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

import type { ComponentPropsWithoutRef, ReactNode } from 'react'

const GAP_WITH_MAP_BUTTON = 4
const MAP_BUTTON_WIDTH = 40
const SHRINKED_MAP_BUTTON_WIDTH = 5
const RIGHT_MENU_OFFSET = 10

type MapToolBoxProps = ComponentPropsWithoutRef<'div'> & {
  children?: ReactNode
  hideBoxShadow?: boolean
  isAnchoredToMapEdge?: boolean
  isHidden?: boolean
  isLeftBox?: boolean
  isOpen: boolean
  isReportingOpen?: boolean
  isTransparent?: boolean
}
export function MapToolBox({
  children,
  className,
  hideBoxShadow,
  isAnchoredToMapEdge = false,
  isHidden,
  isLeftBox,
  isOpen,
  isReportingOpen = false,
  isTransparent,
  ...rest
}: MapToolBoxProps) {
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)

  return (
    <StyledMapToolBox
      $hideBoxShadow={hideBoxShadow}
      $isAnchoredToMapEdge={isAnchoredToMapEdge}
      $isLeftBox={isLeftBox}
      $isOpen={isOpen}
      $isReportingOpen={isReportingOpen}
      $isRightMenuShrinked={!rightMenuIsOpen}
      $isTransparent={isTransparent}
      className={className}
      isHidden={isHidden}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      {children}
    </StyledMapToolBox>
  )
}

const StyledMapToolBox = styled(MapComponent)<{
  $hideBoxShadow?: boolean | undefined
  $isAnchoredToMapEdge: boolean
  $isLeftBox?: boolean | undefined
  $isOpen: boolean
  $isReportingOpen?: boolean | undefined
  $isRightMenuShrinked?: boolean | undefined
  $isTransparent?: boolean | undefined
  isHidden?: boolean | undefined
}>`
  background: ${p => (p.$isTransparent ? 'unset' : p.theme.color.white)};

  ${p => {
    if (p.$isLeftBox) {
      return `margin-left: ${p.$isOpen ? '45px' : '-420px'};`
    }

    const margin = (p.$isRightMenuShrinked ? SHRINKED_MAP_BUTTON_WIDTH : MAP_BUTTON_WIDTH) + GAP_WITH_MAP_BUTTON

    return `margin-right: ${p.$isOpen ? `${margin}px` : '-420px'};`
  }}

  opacity: ${p => (p.$isOpen ? '1' : '0')};

  ${p => {
    if (p.$isLeftBox) {
      return 'left: 6px;'
    }

    const reportingOffset = p.$isReportingOpen ? REPORTING_MAP_FORM_WIDTH : 0
    const rightMenuOffset = p.$isAnchoredToMapEdge && !p.$isRightMenuShrinked ? RIGHT_MENU_OFFSET : 0

    return `right: ${rightMenuOffset + reportingOffset}px;`
  }}

  border-radius: 2px;
  position: absolute;
  transition: all 0.3s;
  box-shadow: ${p => (p.$hideBoxShadow ? 'unset' : '0px 3px 10px rgba(59, 69, 89, 0.5)')};

  ${p => p.isHidden && 'display: none;'}
`
