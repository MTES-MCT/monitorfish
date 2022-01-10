import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

const SideWindowSubMenuLink = ({ menu, isSelected, setSelected, number }) => {
  return <Link
    selected={isSelected}
    onClick={() => setSelected(menu)}
  >
    <Text>{ menu.name }</Text>
    {
      number
        ? <CircleWithKeyMetric>{number}</CircleWithKeyMetric>
        : null
    }
  </Link>
}

const Text = styled.div`
  max-width: 100px;
  color: ${props => props.selected ? COLORS.gunMetal : COLORS.slateGray};
  height: 50px;
  font-size: 16px;
  font-weight: 700;
`

const Link = styled.div`
  height: 64px;
  padding: 0px 20px;
  background: ${props => props.selected ? COLORS.lightGray : 'unset'};
  cursor: pointer;
  display: flex;
  align-items: center;
`

const CircleWithKeyMetric = styled.span`
  display: inline-block;
  height: 9px;
  margin-left: 6px;
  border-radius: 30%;
  padding: 0px 6px 12px 5px;
  color: white;
  background: ${COLORS.charcoal};
  font-size: 13px;
  flex-shrink: 0;
  margin-left: auto;
`

export default SideWindowSubMenuLink
