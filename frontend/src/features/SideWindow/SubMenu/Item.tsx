import styled from 'styled-components'

import type { Option } from '@mtes-mct/monitor-ui'
import type { Promisable } from 'type-fest'

type ItemProps<T extends string = string> = {
  counter: ((subMenu: T) => number) | undefined
  isSelected: boolean
  onClick: (nextSubMenuItem: T) => Promisable<void>
  option: Option<T>
}
export function Item<T extends string = string>({ counter, isSelected, onClick, option }: ItemProps<T>) {
  const count = counter ? counter(option.value) : 0

  return (
    <MenuButton
      $isSelected={isSelected}
      data-cy={`side-window-sub-menu-${option.value}`}
      onClick={() => onClick(option.value)}
    >
      {option.label}
      {count > 0 && (
        <CircleWithKeyMetric data-cy={`side-window-sub-menu-${option.value}-number`}>{count}</CircleWithKeyMetric>
      )}
    </MenuButton>
  )
}

const MenuButton = styled.div<{
  $isSelected: boolean
}>`
  align-items: center;
  background: ${p => (p.$isSelected ? p.theme.color.lightGray : 'unset')};
  border-bottom: 0.5px solid ${p => p.theme.color.lightGray};
  cursor: pointer;
  display: flex;
  height: 47px;
  justify-content: space-between;
  opacity: 1;
  padding: 0px 16px;
  transition: all 0.5s ease;
  width: 190px;
`

const CircleWithKeyMetric = styled.span`
  background: ${p => p.theme.color.charcoal};
  border-radius: 2px;
  color: ${p => p.theme.color.white};
  font-size: 13px;
  line-height: 1;
  padding: 1px 4px 4px;
  transition: opacity 0.5s ease;
`
