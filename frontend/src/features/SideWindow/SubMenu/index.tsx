import { useState } from 'react'
import styled from 'styled-components'

import { Item } from './Item'
import { COLORS } from '../../../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../../icons/Chevron_simple_gris.svg'

import type { Option } from '@mtes-mct/monitor-ui'
import type { CSSProperties } from 'react'
import type { Promisable } from 'type-fest'

type SubMenuProps = {
  counter: ((subMenu: string) => number) | undefined
  isFixed: boolean
  options: Array<Option>
  selectedSubMenu: string
  // TODO Rename that.
  setIsFixed: (isFixed: boolean) => Promisable<void>
  setSelectedSubMenu: (nexSubMenuO: string) => Promisable<void>
}
export function SubMenu({ counter, isFixed, options, selectedSubMenu, setIsFixed, setSelectedSubMenu }: SubMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Wrapper isOpen={isOpen}>
      <Menu
        isFixed={isFixed}
        isOpen={isOpen}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => !isFixed && setIsOpen(false)}
      >
        <Chevron
          data-cy="side-window-sub-menu-trigger"
          onClick={() => setIsFixed(!isFixed)}
          style={chevronStyle(isOpen)}
        >
          <ChevronIcon style={chevronIconStyle(isOpen)} />
        </Chevron>
        <Title style={titleStyle(isOpen)}>Vue d’ensemble</Title>
        {options.map(option => (
          <Item
            key={JSON.stringify(option.value)}
            counter={counter}
            isOneLine
            isOpen={isOpen}
            isSelected={option.value === selectedSubMenu}
            onClick={setSelectedSubMenu}
            option={option}
          />
        ))}
      </Menu>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  isOpen: boolean
}>`
  flex-grow: 1;
  position: relative;
  width: ${p => (p.isOpen ? '200px' : '30px')};
`
const Menu = styled.div<{
  isFixed: boolean
  isOpen: boolean
}>`
  background: ${p => p.theme.color.gainsboro};
  border-right: 1px solid ${p => p.theme.color.lightGray};
  box-shadow: ${p => (p.isOpen && !p.isFixed ? '#CCCFD6 10px 0px 10px -8px' : 'unset')};
  color: ${p => p.theme.color.slateGray};
  flex-shrink: 0;
  font-size: 16;
  font-weight: 500;
  height: 100%;
  padding: 14px 0;
  position: ${p => (p.isFixed ? 'unset' : 'absolute')};
  transition: 'width 0.5s';
  width: ${p => (p.isOpen ? '200px' : '30px')};
  z-index: 999;
`

const Chevron = styled.div``
const chevronStyle = (isOpen: boolean): CSSProperties => ({
  background: COLORS.white,
  border: `1px solid ${COLORS.lightGray}`,
  borderRadius: '50%',
  cursor: 'pointer',
  height: 24,
  marginLeft: isOpen ? 186 : 15,
  position: 'absolute',
  transition: 'all 0.5s',
  width: 24
})

const ChevronIcon = styled(ChevronIconSVG)``
const chevronIconStyle = isOpen => ({
  height: 8,
  marginLeft: 5,
  marginTop: 8,
  transform: isOpen ? 'rotate(270deg)' : 'rotate(90deg)',
  transition: 'all 0.5s'
})

const Title = styled.span``
const titleStyle = (isOpen: boolean): CSSProperties => ({
  borderBottom: `1px solid ${COLORS.lightGray}`,
  display: 'inline-block',
  opacity: isOpen ? 1 : 0,
  overflow: 'hidden',
  paddingBottom: 11,
  paddingLeft: 20,
  textOverflow: 'clip',
  transition: 'width 0.8s ease',
  whiteSpace: 'nowrap',
  width: isOpen ? 180 : 0
})
