import { useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'

import type { MenuItem } from './types'
import type { CSSProperties } from 'react'
import type { Promisable } from 'type-fest'

export type SideWindowSubMenuLinkProps = {
  isOpen: boolean
  isSelected: boolean
  menu: MenuItem
  number: number
  oneLine?: boolean
  setSelected: (nextMenu: MenuItem) => Promisable<void>
}

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 */
export function SideWindowSubMenuLink({
  isOpen,
  isSelected,
  menu,
  number,
  // TODO Rename this prop.
  oneLine = false,
  setSelected
}: SideWindowSubMenuLinkProps) {
  const linkStyle: CSSProperties = useMemo(
    () => ({
      alignItems: 'center',
      background: isOpen && isSelected ? COLORS.lightGray : 'unset',
      borderBottom: isOpen ? `0.5px solid ${COLORS.lightGray}` : 'unset',
      cursor: 'pointer',
      display: 'flex',
      height: oneLine ? 47 : 64,
      opacity: isOpen ? 1 : 0,
      padding: '0px 20px',
      transition: 'all 0.5s ease',
      width: isOpen ? 160 : 0
    }),
    [isOpen, isSelected, oneLine]
  )

  const textStyle: CSSProperties = useMemo(
    () => ({
      color: isSelected ? COLORS.gunMetal : COLORS.slateGray,
      fontSize: 16,
      fontWeight: 500,
      height: oneLine ? 22 : 50,
      // eslint-disable-next-line no-nested-ternary
      maxWidth: isOpen ? (oneLine ? 170 : 100) : 0,
      opacity: isOpen ? 1 : 0,
      overflowX: !oneLine ? 'unset' : 'hidden',
      overflowY: 'hidden',
      textOverflow: !oneLine ? 'unset' : 'clip',
      transition: 'max-width 0.5s ease, opacity 0.5s ease',
      whiteSpace: !oneLine ? 'unset' : 'nowrap',
      width: isOpen ? 160 : 0
    }),
    [isOpen, isSelected, oneLine]
  )

  return (
    <MenuButton data-cy={`side-window-sub-menu-${menu.name}`} onClick={() => setSelected(menu)} style={linkStyle}>
      <Text style={textStyle}>{menu.name}</Text>
      {number ? (
        <CircleWithKeyMetric data-cy={`side-window-sub-menu-${menu.name}-number`} style={circleMetricStyle(isOpen)}>
          {number}
        </CircleWithKeyMetric>
      ) : null}
    </MenuButton>
  )
}

const Text = styled.div``

const MenuButton = styled.button``

const CircleWithKeyMetric = styled.span``
const circleMetricStyle = (isOpen: boolean): CSSProperties => ({
  background: COLORS.charcoal,
  borderRadius: 2,
  color: 'white',
  display: 'inline-block',
  flexShrink: 0,
  fontSize: 13,
  height: 7,
  lineHeight: '17px',
  marginLeft: 'auto',
  minWidth: 7,
  opacity: isOpen ? 1 : 0,
  padding: '0px 6px 12px 5px',
  transition: 'opacity 0.5s ease'
})
