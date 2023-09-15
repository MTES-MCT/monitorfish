// TODO Use `styled` instead of CSS props.

import { useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'

import type { Option } from '@mtes-mct/monitor-ui'
import type { CSSProperties } from 'react'
import type { Promisable } from 'type-fest'

type ItemProps<T extends string = string> = {
  counter: ((subMenu: T) => number) | undefined
  isSelected: boolean
  onClick: (nextSubMenuItem: T) => Promisable<void>
  option: Option<T>
}
export function Item<T extends string = string>({ counter, isSelected, onClick, option }: ItemProps<T>) {
  const linkStyle: CSSProperties = useMemo(
    () => ({
      alignItems: 'center',
      background: isSelected ? COLORS.lightGray : 'unset',
      borderBottom: `0.5px solid ${COLORS.lightGray}`,
      cursor: 'pointer',
      display: 'flex',
      height: 47,
      opacity: 1,
      padding: '0px 16px',
      transition: 'all 0.5s ease',
      width: 190
    }),
    [isSelected]
  )

  const textStyle: CSSProperties = useMemo(
    () => ({
      color: isSelected ? COLORS.gunMetal : COLORS.slateGray,
      fontSize: 16,
      fontWeight: 500,
      height: 22,
      maxWidth: 170,
      opacity: 1,
      overflowX: 'hidden',
      overflowY: 'hidden',
      textOverflow: 'clip',
      transition: 'max-width 0.5s ease, opacity 0.5s ease',
      whiteSpace: 'nowrap',
      width: 190
    }),
    [isSelected]
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
        <CircleWithKeyMetric data-cy={`side-window-sub-menu-${option.value}-number`}>{count}</CircleWithKeyMetric>
      )}
    </MenuButton>
  )
}

const Text = styled.div``

const MenuButton = styled.div``

const CircleWithKeyMetric = styled.span`
  background: ${p => p.theme.color.charcoal};
  border-radius: 2;
  color: ${p => p.theme.color.white};
  display: inline-block;
  flex-shrink: 0;
  font-size: 13;
  height: 7;
  line-height: 17px;
  margin-left: auto;
  min-width: 7;
  padding: 0px 6px 12px 5px;
  transition: opacity 0.5s ease;
`
