import { MapComponent } from '@features/commonStyles/MapComponent'
import { REPORTING_MAP_FORM_WIDTH } from '@features/Reporting/components/IUUReportingMapForm'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type MapToolBoxProps = ComponentPropsWithoutRef<'div'> & {
  children?: ReactNode
  hideBoxShadow?: boolean
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

    const margin = p.$isRightMenuShrinked ? 10 : 45

    return `margin-right: ${p.$isOpen ? `${margin}px` : '-420px'};`
  }}

  opacity: ${p => (p.$isOpen ? '1' : '0')};

  ${p => {
    if (p.$isLeftBox) {
      return 'left: 12px;'
    }

    const reportingOffset = p.$isReportingOpen ? REPORTING_MAP_FORM_WIDTH : 0

    return p.$isRightMenuShrinked ? `right: ${reportingOffset}px;` : `right: ${10 + reportingOffset}px;`
  }}

  border-radius: 2px;
  position: absolute;
  transition: all 0.3s;
  box-shadow: ${p => (p.$hideBoxShadow ? 'unset' : '0px 3px 10px rgba(59, 69, 89, 0.5)')};

  ${p => p.isHidden && 'display: none;'}
`
