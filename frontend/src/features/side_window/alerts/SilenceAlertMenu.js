import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { useClickOutsideWhenOpenedWithinRef } from '../../../hooks/useClickOutsideWhenOpenedWithinRef'
import { SilencedAlertPeriod } from '../../../domain/entities/alerts'
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
const SilenceAlertMenu = ({
  showSilencedAlertForIndex,
  setShowSilencedAlertForIndex,
  silenceAlert,
  baseRef,
  id,
  scrollableContainer
}) => {
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
      silencedAlertPeriod: SilencedAlertPeriod.CUSTOM,
      afterDateTime: selectedDates[0],
      beforeDateTime: selectedDates[1]
    }

    silenceAlert(silenceAlertPeriodRequest, id)
  }, [id, selectedDates])

  return <Wrapper
    ref={silencedAlertRefCallback}
    index={showSilencedAlertForIndex}
    style={silenceMenuStyle(showSilencedAlertForIndex, scrollableContainer?.current.scrollTop || 0)}
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
        onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.THIS_OCCURRENCE), id)}
      >
        Cette occurence
      </MenuLink>
      <MenuLink
        data-cy={'side-window-silence-alert-one-hour'}
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.ONE_HOUR), id)}
      >
        1 heure
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.TWO_HOURS), id)}
      >
        2 heures
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.SIX_HOURS), id)}
      >
        6 heures
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.TWELVE_HOURS), id)}
      >
        12 heures
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.ONE_DAY), id)}
      >
        24 heures
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.ONE_WEEK), id)}
      >
        1 semaine
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.ONE_MONTH), id)}
      >
        1 mois
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true)}
        onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.ONE_YEAR), id)}
      >
        1 année
      </MenuLink>
      <MenuLink
        onMouseOver={e => setBackgroundAsHovered(e)}
        onMouseOut={e => setBackgroundAsNotHovered(e)}
        style={menuLinkStyle(false, true, true)}
      >
        {
          silencedAlertRef?.current
            ? <DateRange
                containerRef={silencedAlertRef?.current}
                defaultValue={selectedDates}
                noMargin
                onChange={setSelectedDates}
                placeholder={'Période précise'}
                width={145}
              />
            : null
        }
      </MenuLink>
    </>
  </Wrapper>
}

const silenceAlertRequestFromMenu = period => ({
  silencedAlertPeriod: period,
  afterDateTime: null,
  beforeDateTime: null
})

function setBackgroundAsHovered (e) {
  e.currentTarget.style.background = COLORS.gainsboro
}

function setBackgroundAsNotHovered (e) {
  e.currentTarget.style.background = COLORS.background
}

const Wrapper = styled.div``
const silenceMenuStyle = (index, scrollY) => ({
  top: 0,
  position: 'absolute',
  marginTop: 35 + index * 49 - scrollY,
  marginLeft: 940,
  width: 220,
  boxShadow: `1px 2px 5px ${COLORS.overlayShadowDarker}`,
  zIndex: 999
})

const MenuLink = styled.span``
const menuLinkStyle = (withBottomLine, hasLink, isCalendar) => ({
  background: COLORS.background,
  padding: isCalendar ? '3px 15px 15px' : '5px 15px 0px 15px',
  height: 25,
  display: 'flex',
  borderBottom: `${withBottomLine ? 1 : 0}px solid ${COLORS.lightGray}`,
  color: COLORS.slateGray,
  cursor: hasLink ? 'pointer' : 'unset'
})

export default SilenceAlertMenu
