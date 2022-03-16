import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param isOpen
 * @param menu
 * @param isSelected
 * @param setSelected
 * @param number
 * @param oneLine
 * @return {JSX.Element}
 * @constructor
 */
const SideWindowSubMenuLink = ({ isOpen, menu, isSelected, setSelected, number, oneLine }) => {
  const linkStyle = {
    height: oneLine ? 47 : 64,
    padding: '0px 20px',
    background: isOpen && isSelected ? COLORS.lightGray : 'unset',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    borderBottom: isOpen ? `0.5px solid ${COLORS.lightGray}` : 'unset',
    opacity: isOpen ? 1 : 0,
    transition: 'opacity 0.5s ease'
  }

  const textStyle = {
    maxWidth: oneLine ? 170 : 100,
    color: isSelected ? COLORS.gunMetal : COLORS.slateGray,
    height: oneLine ? 22 : 50,
    fontSize: 16,
    fontWeight: 500,
    opacity: isOpen ? 1 : 0,
    transition: 'opacity 0.5s ease'
  }

  return <Link
    data-cy={`side-window-sub-menu-${menu.name}`}
    selected={isSelected}
    onClick={() => setSelected(menu)}
    oneLine={oneLine}
    style={linkStyle}
  >
    <Text style={textStyle}>
      { menu.name }
    </Text>
    {
      number
        ? <CircleWithKeyMetric
          data-cy={`side-window-sub-menu-${menu.name}-number`}
          style={circleMetricStyle(isOpen)}
        >
          {number}
      </CircleWithKeyMetric>
        : null
    }
  </Link>
}

const Text = styled.div``

const Link = styled.div``

const CircleWithKeyMetric = styled.span``
const circleMetricStyle = isOpen => ({
  display: 'inline-block',
  height: 7,
  borderRadius: 2,
  padding: '0px 6px 12px 5px',
  color: 'white',
  background: COLORS.charcoal,
  fontSize: 13,
  flexShrink: 0,
  marginLeft: 'auto',
  minWidth: 7,
  lineHeight: '16px',
  opacity: isOpen ? 1 : 0,
  transition: 'opacity 0.5s ease'
})

export default SideWindowSubMenuLink
