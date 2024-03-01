import styled from 'styled-components'

import { Item } from './Item'

import type { Option } from '@mtes-mct/monitor-ui'
import type { Promisable } from 'type-fest'

type SubMenuProps<T extends string = string> = {
  counter: ((subMenu: T) => number) | undefined
  onChange: (nextSubMenuItem: T) => Promisable<void>
  options: Option<T>[]
  value: T
}
export function SubMenu<T extends string = string>({ counter, onChange, options, value }: SubMenuProps<T>) {
  return (
    <Wrapper>
      <Menu>
        {options.map(option => (
          <Item
            key={JSON.stringify(option.value)}
            counter={counter}
            isSelected={option.value === value}
            onClick={onChange}
            option={option}
          />
        ))}
      </Menu>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  min-width: 222px;
`

const Menu = styled.div`
  background: ${p => p.theme.color.gainsboro};
  border-right: 1px solid ${p => p.theme.color.lightGray};
  color: ${p => p.theme.color.slateGray};
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 500;
  height: 100%;
  transition: 'width 0.5s';
  width: 222px;
  z-index: 999;
`
