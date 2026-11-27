import { MapComponent } from '@features/commonStyles/MapComponent'
import { REPORTING_MAP_FORM_WIDTH } from '@features/Reporting/components/IUUReportingMapForm/constants'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export const GAP_WITH_MAP_BUTTON = 4
const MAP_BUTTON_WIDTH = 40
const SHRINKED_MAP_BUTTON_WIDTH = 5
const RIGHT_MENU_OFFSET = 10

/** Distance between the right edge of the map and the right edge of an opened, right-side, tool box. */
export function getOpenedMapToolBoxRight({
  isAnchoredToMapEdge,
  isReportingOpen,
  isRightMenuShrinked
}: {
  isAnchoredToMapEdge: boolean
  isReportingOpen: boolean
  isRightMenuShrinked: boolean
}): number {
  return (
    getMapToolBoxRight(isAnchoredToMapEdge, isReportingOpen, isRightMenuShrinked) +
    getMapToolBoxMargin(isRightMenuShrinked)
  )
}

function getMapToolBoxMargin(isRightMenuShrinked: boolean | undefined): number {
  return (isRightMenuShrinked ? SHRINKED_MAP_BUTTON_WIDTH : MAP_BUTTON_WIDTH) + GAP_WITH_MAP_BUTTON
}

function getMapToolBoxRight(
  isAnchoredToMapEdge: boolean,
  isReportingOpen: boolean | undefined,
  isRightMenuShrinked: boolean | undefined
): number {
  const reportingOffset = isReportingOpen ? REPORTING_MAP_FORM_WIDTH : 0
  const rightMenuOffset = isAnchoredToMapEdge && !isRightMenuShrinked ? RIGHT_MENU_OFFSET : 0

  return rightMenuOffset + reportingOffset
}

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

    return `margin-right: ${p.$isOpen ? `${getMapToolBoxMargin(p.$isRightMenuShrinked)}px` : '-420px'};`
  }}

  opacity: ${p => (p.$isOpen ? '1' : '0')};

  ${p => {
    if (p.$isLeftBox) {
      return 'left: 6px;'
    }

    return `right: ${getMapToolBoxRight(p.$isAnchoredToMapEdge, p.$isReportingOpen, p.$isRightMenuShrinked)}px;`
  }}

  border-radius: 2px;
  position: absolute;
  transition: all 0.3s;
  box-shadow: ${p => (p.$hideBoxShadow ? 'unset' : `0px 3px 10px ${p.theme.color.charcoalShadow}`)};

  ${p => p.isHidden && 'display: none;'}
`
