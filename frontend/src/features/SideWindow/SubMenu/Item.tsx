// TODO Use `styled` instead of CSS props.

import { useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'

import type { Option } from '@mtes-mct/monitor-ui'
import type { CSSProperties } from 'react'
import type { Promisable } from 'type-fest'

type ItemProps<T extends string = string> = {
  counter: ((subMenu: T) => number) | undefined
  isOpen: boolean
  isSelected: boolean
  onClick: (nextSubMenuItem: T) => Promisable<void>
  option: Option<T>
}
export function Item<T extends string = string>({ counter, isOpen, isSelected, onClick, option }: ItemProps<T>) {
  const linkStyle: CSSProperties = useMemo(
    () => ({
      alignItems: 'center',
      background: isOpen && isSelected ? COLORS.lightGray : 'unset',
      borderBottom: isOpen ? `0.5px solid ${COLORS.lightGray}` : 'unset',
      cursor: 'pointer',
      display: 'flex',
      height: 47,
      opacity: isOpen ? 1 : 0,
      padding: '0px 16px',
      transition: 'all 0.5s ease',
      width: isOpen ? 190 : 0
    }),
    [isOpen, isSelected]
  )

  const textStyle: CSSProperties = useMemo(
    () => ({
      color: isSelected ? COLORS.gunMetal : COLORS.slateGray,
      fontSize: 16,
      fontWeight: 500,
      height: 22,
      maxWidth: isOpen ? 170 : 0,
      opacity: isOpen ? 1 : 0,
      overflowX: 'hidden',
      overflowY: 'hidden',
      textOverflow: 'clip',
      transition: 'max-width 0.5s ease, opacity 0.5s ease',
      whiteSpace: 'nowrap',
      width: isOpen ? 190 : 0
    }),
    [isOpen, isSelected]
  )

  const count = counter ? counter(option.value) : 0

  return (
    <MenuButton
      data-cy={`side-window-sub-menu-${option.value}`}
      onClick={() => onClick(option.value)}
      style={linkStyle}
    >
      <Text style={textStyle}>{option.label}</Text>
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
