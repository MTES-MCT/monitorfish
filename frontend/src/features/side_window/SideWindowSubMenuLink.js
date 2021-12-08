import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

const SideWindowSubMenuLink = ({ menu, isSelected, setSelected }) => {
  return <Link
    selected={isSelected}
    onClick={() => setSelected(menu)}
  >
    { menu.name }
  </Link>
}

const Link = styled.div`
  color: ${props => props.selected ? COLORS.gunMetal : COLORS.slateGray};
  height: 64px;
  font-size: 16px;
  font-weight: 700;
  padding: 0px 20px;
  background: ${props => props.selected ? COLORS.lightGray : 'unset'};
  cursor: pointer;
  display: flex;
  align-items: center;
`

export default SideWindowSubMenuLink
