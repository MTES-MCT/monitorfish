import styled from 'styled-components'

import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { MapButtonStyle } from '../../commonStyles/MapButton.style'

import type { CSSProperties, ReactNode } from 'react'

type MapToolButtonProps = {
  children: ReactNode
  dataCy?: string
  isActive: boolean
  isLeftButton?: boolean
  onClick: () => void
  style?: CSSProperties
  title: string
}
export function MapToolButton({
  children,
  dataCy,
  isActive,
  isLeftButton = false,
  onClick,
  style,
  title
}: MapToolButtonProps) {
  const { healthcheckTextWarning, previewFilteredVesselsMode, rightMenuIsOpen } = useMainAppSelector(
    state => state.global
  )
  const isRightMenuShrinked = !rightMenuIsOpen && !isLeftButton

  return (
    <StyledMapToolButton
      $isActive={isActive}
      $isLeftButton={isLeftButton}
      $isRightMenuShrinked={isRightMenuShrinked}
      data-cy={dataCy}
      healthcheckTextWarning={!!healthcheckTextWarning}
      isHidden={!!previewFilteredVesselsMode}
      onClick={onClick}
      style={style}
      title={title}
    >
      {children}
    </StyledMapToolButton>
  )
}

const StyledMapToolButton = styled(MapButtonStyle)<{
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
