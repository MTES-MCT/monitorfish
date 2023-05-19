import { useState } from 'react'
import styled from 'styled-components'

import { Item } from './Item'
import { ReactComponent as ChevronIconSVG } from '../../icons/Chevron_simple_gris.svg'

import type { Option } from '@mtes-mct/monitor-ui'
import type { Promisable } from 'type-fest'

type SubMenuProps<T extends string = string> = {
  counter: ((subMenu: T) => number) | undefined
  onChange: (nextSubMenuItem: T) => Promisable<void>
  options: Option<T>[]
  value: T
}
export function SubMenu<T extends string = string>({ counter, onChange, options, value }: SubMenuProps<T>) {
  const [isFixed, setIsFixed] = useState(true)
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Wrapper $isOpen={isOpen}>
      <Menu
        $isFixed={isFixed}
        $isOpen={isOpen}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => !isFixed && setIsOpen(false)}
      >
        <Chevron $isOpen={isOpen} data-cy="side-window-sub-menu-trigger" onClick={() => setIsFixed(!isFixed)}>
          <ChevronIcon $isOpen={isOpen} />
        </Chevron>

        {options.map(option => (
          <Item
            key={JSON.stringify(option.value)}
            counter={counter}
            isOpen={isOpen}
            isSelected={option.value === value}
            onClick={onChange}
            option={option}
          />
        ))}
      </Menu>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $isOpen: boolean
}>`
  flex-grow: 1;
  position: relative;
  min-width: ${p => (p.$isOpen ? '222px' : '30px')};
`

const Menu = styled.div<{
  $isFixed: boolean
  $isOpen: boolean
}>`
  background: ${p => p.theme.color.gainsboro};
  border-right: 1px solid ${p => p.theme.color.lightGray};
  box-shadow: ${p => (p.$isOpen && !p.$isFixed ? '#CCCFD6 10px 0px 10px -8px' : 'unset')};
  color: ${p => p.theme.color.slateGray};
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 500;
  height: 100%;
  padding-top: 50px;
  position: ${p => (p.$isFixed ? 'unset' : 'absolute')};
  transition: 'width 0.5s';
  width: ${p => (p.$isOpen ? '222px' : '30px')};
  z-index: 999;
`

const Chevron = styled.div<{
  $isOpen: boolean
}>`
  background: ${p => p.theme.color.white};
  border: 1px solid ${p => p.theme.color.lightGray};
  border-radius: 50%;
  cursor: pointer;
  height: 24px;
  margin-left: ${p => (p.$isOpen ? 186 : 15)}px;
  position: absolute;
  top: 14px;
  transition: all 0.5s;
  width: 24px;
`
const ChevronIcon = styled(ChevronIconSVG)<{
  $isOpen: boolean
}>`
  height: 8px;
  margin-left: 5px;
  margin-top: 8px;
  transform: ${p => (p.$isOpen ? 'rotate(270deg)' : 'rotate(90deg)')};
  transition: all 0.5s;
`
