import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { SilencedAlertPeriod } from '../../../domain/entities/alerts'
import { useClickOutsideWhenOpenedWithinRef } from '../../../hooks/useClickOutsideWhenOpenedWithinRef'
import DateRange from '../../vessel_sidebar/actions/TrackRequest/DateRange'

/**
 * @typedef {object} SilenceAlertMenuProps
 * @property {*} showSilencedAlertForIndex
 * @property {*} setShowSilencedAlertForIndex
 * @property {*} silenceAlert
 * @property {*} baseRef
 * @property {*} id
 * @property {*} scrollableContainer
 */

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 *
 * @param {SilenceAlertMenuProps} props
 */
function SilenceAlertMenu({
  baseRef,
  id,
  scrollableContainer,
  setShowSilencedAlertForIndex,
  showSilencedAlertForIndex,
  silenceAlert
}) {
  const [silencedAlertRef, setSilencedAlertRef] = useState(null)
  const silencedAlertRefCallback = useCallback(node => {
    if (node !== null) {
      setSilencedAlertRef({ current: node })
    }
  }, [])
  const clickedOutside = useClickOutsideWhenOpenedWithinRef(silencedAlertRef, showSilencedAlertForIndex, baseRef)
  /** @type {[[Date, Date], *]} */
  const [selectedDates, setSelectedDates] = useState()

  useEffect(() => {
    if (clickedOutside) {
      setShowSilencedAlertForIndex(null)
    }
  }, [clickedOutside])

  useEffect(() => {
    if (!selectedDates) {
      return
    }

    setShowSilencedAlertForIndex(null)

    const silenceAlertPeriodRequest = {
      afterDateTime: selectedDates[0],
      beforeDateTime: selectedDates[1],
      silencedAlertPeriod: SilencedAlertPeriod.CUSTOM
    }

    silenceAlert(silenceAlertPeriodRequest, id)
  }, [id, selectedDates])

  return (
    <Wrapper
      ref={silencedAlertRefCallback}
      index={showSilencedAlertForIndex}
      style={silenceMenuStyle(showSilencedAlertForIndex, scrollableContainer?.current.scrollTop || 0)}
    >
      <>
        <MenuLink style={menuLinkStyle(true, false)}>Ignorer l&apos;alerte pour...</MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.THIS_OCCURRENCE), id)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          Cette occurence
        </MenuLink>
        <MenuLink
          data-cy="side-window-silence-alert-one-hour"
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.ONE_HOUR), id)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          1 heure
        </MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.TWO_HOURS), id)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          2 heures
        </MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.SIX_HOURS), id)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          6 heures
        </MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.TWELVE_HOURS), id)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          12 heures
        </MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.ONE_DAY), id)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          24 heures
        </MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.ONE_WEEK), id)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          1 semaine
        </MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.ONE_MONTH), id)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          1 mois
        </MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.ONE_YEAR), id)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          1 année
        </MenuLink>
        <MenuLink
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true, true)}
        >
          {silencedAlertRef?.current ? (
            <DateRange
              containerRef={silencedAlertRef?.current}
              defaultValue={selectedDates}
              noMargin
              onChange={setSelectedDates}
              placeholder="Période précise"
              width={145}
            />
          ) : null}
        </MenuLink>
      </>
    </Wrapper>
  )
}

const silenceAlertRequestFromMenu = period => ({
  afterDateTime: null,
  beforeDateTime: null,
  silencedAlertPeriod: period
})

function setBackgroundAsHovered(e) {
  e.currentTarget.style.background = COLORS.gainsboro
}

function setBackgroundAsNotHovered(e) {
  e.currentTarget.style.background = COLORS.background
}

const Wrapper = styled.div``
const silenceMenuStyle = (index, scrollY) => ({
  boxShadow: `1px 2px 5px ${COLORS.overlayShadowDarker}`,
  marginLeft: 940,
  marginTop: 35 + index * 49 - scrollY,
  position: 'absolute',
  top: 0,
  width: 220,
  zIndex: 999
})

const MenuLink = styled.span``
const menuLinkStyle = (withBottomLine, hasLink, isCalendar) => ({
  background: COLORS.background,
  borderBottom: `${withBottomLine ? 1 : 0}px solid ${COLORS.lightGray}`,
  color: COLORS.slateGray,
  cursor: hasLink ? 'pointer' : 'unset',
  display: 'flex',
  height: 25,
  padding: isCalendar ? '3px 15px 15px' : '5px 15px 0px 15px'
})

export default SilenceAlertMenu
