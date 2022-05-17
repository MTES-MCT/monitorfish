import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { useClickOutsideWhenOpenedWithinRef } from '../../../hooks/useClickOutsideWhenOpenedWithinRef'

function setBackgroundAsHovered (e) {
  e.currentTarget.style.background = COLORS.gainsboro
}

function setBackgroundAsNotHovered (e) {
  e.currentTarget.style.background = COLORS.background
}

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param showIgnoreAlertForIndex
 * @param setShowIgnoreAlertForIndex
 * @param ignoreAlert
 * @param baseRef
 * @param id
 * @return {JSX.Element}
 * @constructor
 */
const IgnoreMenu = ({ showIgnoreAlertForIndex, setShowIgnoreAlertForIndex, ignoreAlert, baseRef, id }) => {
  const ignoreAlertRef = useRef()
  const clickedOutside = useClickOutsideWhenOpenedWithinRef(ignoreAlertRef, showIgnoreAlertForIndex, baseRef)

  useEffect(() => {
    if (clickedOutside) {
      setShowIgnoreAlertForIndex(null)
    }
  }, [clickedOutside])

  return <Wrapper
    ref={ignoreAlertRef}
    index={showIgnoreAlertForIndex}
    style={ignoreMenuStyle(showIgnoreAlertForIndex)}
  >
    <>
      <MenuLink
        style={menuLinkStyle(true, false)}>
        Ignorer l&apos;alerte pour...
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => ignoreAlert(null, id)}
      >
        Cette occurence
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => ignoreAlert(null, id)}
      >
        1 heure
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => ignoreAlert(null, id)}
      >
        2 heures
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => ignoreAlert(null, id)}
      >
        6 heures
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => ignoreAlert(null, id)}
      >
        12 heures
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => ignoreAlert(null, id)}
      >
        24 heures
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => ignoreAlert(null, id)}
      >
        1 semaine
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => ignoreAlert(null, id)}
      >
        1 mois
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => ignoreAlert(null, id)}
      >
        1 année
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => ignoreAlert(null, id)}
      >
        Choisir une prériode précise
      </MenuLink>
    </>
  </Wrapper>
}

const Wrapper = styled.div``
const ignoreMenuStyle = index => ({
  top: 0,
  position: 'absolute',
  marginTop: 35 + index * 49,
  marginLeft: 1055,
  width: 220,
  boxShadow: `1px 2px 5px ${COLORS.overlayShadowDarker}`
})

const MenuLink = styled.span``
const menuLinkStyle = (withBottomLine, hasLink) => ({
  background: COLORS.background,
  padding: '5px 15px 0px 15px',
  height: 25,
  display: 'flex',
  borderBottom: `${withBottomLine ? 1 : 0}px solid ${COLORS.lightGray}`,
  color: COLORS.slateGray,
  cursor: hasLink ? 'pointer' : 'unset'
})

export default IgnoreMenu
