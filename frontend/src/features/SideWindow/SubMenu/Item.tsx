import { useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'

import type { Option } from '@mtes-mct/monitor-ui'
import type { CSSProperties } from 'react'
import type { Promisable } from 'type-fest'

export type ItemProps = {
  counter: ((subMenu: string) => number) | undefined
  isOneLine?: boolean
  isOpen: boolean
  isSelected: boolean
  onClick: (nextSubMenu: string) => Promisable<void>
  option: Option
}

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 */
export function Item({
  counter,
  isOneLine = false,
  isOpen,
  isSelected,
  // TODO Rename this prop.
  onClick,
  option
}: ItemProps) {
  const linkStyle: CSSProperties = useMemo(
    () => ({
      alignItems: 'center',
      background: isOpen && isSelected ? COLORS.lightGray : 'unset',
      borderBottom: isOpen ? `0.5px solid ${COLORS.lightGray}` : 'unset',
      cursor: 'pointer',
      display: 'flex',
      height: isOneLine ? 47 : 64,
      opacity: isOpen ? 1 : 0,
      padding: '0px 20px',
      transition: 'all 0.5s ease',
      width: isOpen ? 160 : 0
    }),
    [isOneLine, isOpen, isSelected]
  )

  const textStyle: CSSProperties = useMemo(
    () => ({
      color: isSelected ? COLORS.gunMetal : COLORS.slateGray,
      fontSize: 16,
      fontWeight: 500,
      height: isOneLine ? 22 : 50,
      // eslint-disable-next-line no-nested-ternary
      maxWidth: isOpen ? (isOneLine ? 170 : 100) : 0,
      opacity: isOpen ? 1 : 0,
      overflowX: !isOneLine ? 'unset' : 'hidden',
      overflowY: 'hidden',
      textOverflow: !isOneLine ? 'unset' : 'clip',
      transition: 'max-width 0.5s ease, opacity 0.5s ease',
      whiteSpace: !isOneLine ? 'unset' : 'nowrap',
      width: isOpen ? 160 : 0
    }),
    [isOneLine, isOpen, isSelected]
  )

  const count = counter ? counter(option.value) : 0

  return (
    <MenuButton
      data-cy={`side-window-sub-menu-${option.value}`}
      onClick={() => onClick(option.value)}
      style={linkStyle}
    >
      <Text style={textStyle}>{option.name}</Text>
      {count > 0 && (
        <CircleWithKeyMetric data-cy={`side-window-sub-menu-${option.value}-number`} style={circleMetricStyle(isOpen)}>
          {count}
        </CircleWithKeyMetric>
      )}
    </MenuButton>
  )
}

const Text = styled.div``

const MenuButton = styled.div``

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
