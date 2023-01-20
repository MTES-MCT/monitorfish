import styled from 'styled-components'

import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { MapButtonStyle } from '../../commonStyles/MapButton.style'

import type { CSSProperties, ReactNode } from 'react'

type MapToolButtonProps = {
  children: ReactNode
  dataCy?: string
  isOpen: boolean
  onClick: () => void
  style?: CSSProperties
  title: string
}
export function MapToolButton({ children, dataCy, isOpen, onClick, style, title }: MapToolButtonProps) {
  const { healthcheckTextWarning, previewFilteredVesselsMode, rightMenuIsOpen } = useMainAppSelector(
    state => state.global
  )
  const isRightMenuShrinked = !rightMenuIsOpen

  return (
    <StyledMapToolButton
      data-cy={dataCy}
      healthcheckTextWarning={!!healthcheckTextWarning}
      isHidden={!!previewFilteredVesselsMode}
      isOpen={isOpen}
      isRightMenuShrinked={isRightMenuShrinked}
      onClick={onClick}
      style={style}
      title={title}
    >
      {children}
    </StyledMapToolButton>
  )
}

const StyledMapToolButton = styled(MapButtonStyle)<{
  isOpen: boolean
  isRightMenuShrinked: boolean
}>`
  position: absolute;
  display: inline-block;
  padding-top: 5px;
  margin-left: 5px;
  z-index: 99;
  height: 40px;
  width: ${p => (p.isRightMenuShrinked ? '5px' : '40px')};
  border-radius: ${p => (p.isRightMenuShrinked ? '1px' : '2px')};
  right: ${p => (p.isRightMenuShrinked ? '0' : '10px')};
  background: ${p => (p.isOpen ? p.theme.color.blueGray[100] : p.theme.color.charcoal)};
  transition: all 0.3s;

  :hover,
  :focus {
    background: ${p => (p.isOpen ? p.theme.color.blueGray[100] : p.theme.color.charcoal)};
  }
`
