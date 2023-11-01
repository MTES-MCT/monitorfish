import styled from 'styled-components'

import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { MapButton } from '../../commonStyles/MapButton'

import type { ReactNode, HTMLProps } from 'react'

type MapToolButtonProps = {
  children: ReactNode
  isActive: boolean
  isLeftButton?: boolean
} & HTMLProps<HTMLButtonElement>
export function MapToolButton({ children, isActive, isLeftButton = false, ...props }: MapToolButtonProps) {
  const { previewFilteredVesselsMode, rightMenuIsOpen } = useMainAppSelector(state => state.global)
  const isRightMenuShrinked = !rightMenuIsOpen && !isLeftButton

  return (
    /**
     * TODO We have this error without the `ts-ignore` :
     *  "TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children,
     *   but only a single child was provided"
     */
    // @ts-ignore
    <StyledMapToolButton
      $isActive={isActive}
      $isLeftButton={isLeftButton}
      $isRightMenuShrinked={isRightMenuShrinked}
      isHidden={!!previewFilteredVesselsMode}
      /* eslint-disable-next-line react/jsx-props-no-spreading */
      {...props}
    >
      {children}
    </StyledMapToolButton>
  )
}

const StyledMapToolButton = styled(MapButton)<{
  $isActive: boolean
  $isLeftButton: boolean
  $isRightMenuShrinked: boolean
}>`
  position: absolute;
  display: inline-block;
  padding-top: 5px;
  ${p => {
    if (p.$isLeftButton) {
      return 'margin-right: 5px;'
    }

    return 'margin-left: 5px;'
  }}
  z-index: 99;
  height: 40px;
  width: ${p => (p.$isRightMenuShrinked ? '5px' : '40px')};
  border-radius: ${p => (p.$isRightMenuShrinked ? '1px' : '2px')};
  ${p => {
    if (p.$isLeftButton) {
      return `left: ${p.$isRightMenuShrinked ? 0 : 10}px;`
    }

    return `right: ${p.$isRightMenuShrinked ? 0 : 10}px;`
  }}
  background: ${p => (p.$isActive ? p.theme.color.blueGray : p.theme.color.charcoal)};
  transition: all 0.3s;

  :hover,
  :focus {
    background: ${p => (p.$isActive ? p.theme.color.blueGray : p.theme.color.charcoal)};
  }
`
