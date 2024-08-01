import styled from 'styled-components'

import { Item } from './Item'

import type { Option } from '@mtes-mct/monitor-ui'
import type { Promisable } from 'type-fest'

type SubMenuProps<T extends string = string> = Readonly<{
  badgeCounter?: ((subMenu: T) => number | undefined) | undefined
  counter: ((subMenu: T) => number) | undefined
  onChange: (nextSubMenuItem: T) => Promisable<void>
  options: Option<T>[]
  value: T
  width?: number
}>
export function SubMenu<T extends string = string>({
  badgeCounter,
  counter,
  onChange,
  options,
  value,
  width = 222
}: SubMenuProps<T>) {
  return (
    <Wrapper width={width}>
      <Menu width={width}>
        {options.map(option => (
          <Item
            key={JSON.stringify(option.value)}
            badgeCounter={badgeCounter}
            counter={counter}
            isSelected={option.value === value}
            onClick={onChange}
            option={option}
            width={width}
          />
        ))}
      </Menu>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  width: number
}>`
  min-width: ${p => p.width}px;
  user-select: none;
  margin-right: 1px;

  * {
    user-select: none;
  }
`

const Menu = styled.div<{
  width: number
}>`
  background: ${p => p.theme.color.gainsboro};
  border-right: 1px solid ${p => p.theme.color.lightGray};
  color: ${p => p.theme.color.slateGray};
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 500;
  height: 100%;
  transition: 'width 0.5s';
  width: ${p => p.width}px;
  z-index: 999;
`
