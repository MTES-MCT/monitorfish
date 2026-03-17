import { MapComponent } from '@features/commonStyles/MapComponent'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type MapToolBoxProps = ComponentPropsWithoutRef<'div'> & {
  children?: ReactNode
  hideBoxShadow?: boolean
  isHidden?: boolean
  isLeftBox?: boolean
  isOpen: boolean
  isTransparent?: boolean
}
export function MapToolBox({
  children,
  className,
  hideBoxShadow,
  isHidden,
  isLeftBox,
  isOpen,
  isTransparent,
  ...rest
}: MapToolBoxProps) {
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)

  return (
    <StyledMapToolBox
      $hideBoxShadow={hideBoxShadow}
      $isLeftBox={isLeftBox}
      $isOpen={isOpen}
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

  ${p => (p.$isLeftBox ? 'left: 12px;' : 'right: 12px;')}

  border-radius: 2px;
  position: absolute;
  transition: all 0.3s;
  box-shadow: ${p => (p.$hideBoxShadow ? 'unset' : '0px 3px 10px rgba(59, 69, 89, 0.5)')};

  ${p => p.isHidden && 'display: none;'}
`
