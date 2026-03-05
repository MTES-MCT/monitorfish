import { MapComponent } from '@features/commonStyles/MapComponent'
import styled from 'styled-components'
import type {ComponentPropsWithoutRef, ReactNode} from "react";
import {useMainAppSelector} from "@hooks/useMainAppSelector";

type MapToolBoxProps = ComponentPropsWithoutRef<'div'> & {
  children?: ReactNode
  hideBoxShadow?: boolean
  isHidden?: boolean
  isLeftBox?: boolean
  isOpen: boolean
  isTransparent?: boolean
}
export function MapToolBox({
  className,
  children,
  hideBoxShadow,
  isHidden,
  isLeftBox,
  isOpen,
  isTransparent,
  ...rest
}: MapToolBoxProps) {
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)

  return <StyledMapToolBox
    className={className}
    $isRightMenuShrinked={!rightMenuIsOpen}
    $hideBoxShadow={hideBoxShadow}
    $isLeftBox={isLeftBox}
    $isOpen={isOpen}
    $isTransparent={isTransparent}
    isHidden={isHidden}
    {...rest}
  >
    {children}
  </StyledMapToolBox>
}

const StyledMapToolBox = styled(MapComponent)<{
  $hideBoxShadow?: boolean | undefined
  $isRightMenuShrinked?: boolean | undefined
  $isLeftBox?: boolean | undefined
  $isOpen: boolean
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
