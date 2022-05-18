import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { useClickOutsideWhenOpenedWithinRef } from '../../../hooks/useClickOutsideWhenOpenedWithinRef'
import { IgnoreAlertPeriod } from '../../../domain/entities/alerts'
import IgnoreAlertCustomPeriodModal from './IgnoreAlertCustomPeriodModal'

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
const IgnoreAlertMenu = ({ showIgnoreAlertForIndex, setShowIgnoreAlertForIndex, ignoreAlert, baseRef, id }) => {
  const ignoreAlertRef = useRef()
  const clickedOutside = useClickOutsideWhenOpenedWithinRef(ignoreAlertRef, showIgnoreAlertForIndex, baseRef)
  const [customDatesModalIsOpen, setCustomDatesModalIsOpen] = useState(false)
  const [selectedDates, setSelectedDates] = useState([])

  useEffect(() => {
    if (clickedOutside) {
      setShowIgnoreAlertForIndex(null)
    }
  }, [clickedOutside])

  useEffect(() => {
    if (!customDatesModalIsOpen) {
      setSelectedDates([])
    }
  }, [customDatesModalIsOpen])

  useEffect(() => {
    if (selectedDates?.length) {
      setCustomDatesModalIsOpen(false)
      setShowIgnoreAlertForIndex(null)

      const ignoreAlertPeriodRequest = {
        ignoreAlertPeriod: IgnoreAlertPeriod.CUSTOM,
        afterDateTime: selectedDates[0],
        beforeDateTime: selectedDates[1]
      }
      ignoreAlert(ignoreAlertPeriodRequest, id)
    }
  }, [selectedDates])

  return <Wrapper
    ref={ignoreAlertRef}
    index={showIgnoreAlertForIndex}
    style={ignoreMenuStyle(showIgnoreAlertForIndex)}
  >
    {
      !customDatesModalIsOpen
        ? <>
          <MenuLink
            style={menuLinkStyle(true, false)}>
            Ignorer l&apos;alerte pour...
          </MenuLink>
          <MenuLink
            onMouseOver={e => setBackgroundAsHovered(e)}
            onMouseOut={e => setBackgroundAsNotHovered(e)}
            style={menuLinkStyle(false, true)}
            onClick={() => ignoreAlert(ignoreAlertRequestFromMenu(IgnoreAlertPeriod.THIS_OCCURRENCE), id)}
          >
            Cette occurence
          </MenuLink>
          <MenuLink
            onMouseOver={e => setBackgroundAsHovered(e)}
            onMouseOut={e => setBackgroundAsNotHovered(e)}
            style={menuLinkStyle(false, true)}
            onClick={() => ignoreAlert(ignoreAlertRequestFromMenu(IgnoreAlertPeriod.ONE_HOUR), id)}
          >
            1 heure
          </MenuLink>
          <MenuLink
            onMouseOver={e => setBackgroundAsHovered(e)}
            onMouseOut={e => setBackgroundAsNotHovered(e)}
            style={menuLinkStyle(false, true)}
            onClick={() => ignoreAlert(ignoreAlertRequestFromMenu(IgnoreAlertPeriod.TWO_HOURS), id)}
          >
            2 heures
          </MenuLink>
          <MenuLink
            onMouseOver={e => setBackgroundAsHovered(e)}
            onMouseOut={e => setBackgroundAsNotHovered(e)}
            style={menuLinkStyle(false, true)}
            onClick={() => ignoreAlert(ignoreAlertRequestFromMenu(IgnoreAlertPeriod.SIX_HOURS), id)}
          >
            6 heures
          </MenuLink>
          <MenuLink
            onMouseOver={e => setBackgroundAsHovered(e)}
            onMouseOut={e => setBackgroundAsNotHovered(e)}
            style={menuLinkStyle(false, true)}
            onClick={() => ignoreAlert(ignoreAlertRequestFromMenu(IgnoreAlertPeriod.TWELVE_HOURS), id)}
          >
            12 heures
          </MenuLink>
          <MenuLink
            onMouseOver={e => setBackgroundAsHovered(e)}
            onMouseOut={e => setBackgroundAsNotHovered(e)}
            style={menuLinkStyle(false, true)}
            onClick={() => ignoreAlert(ignoreAlertRequestFromMenu(IgnoreAlertPeriod.ONE_DAY), id)}
          >
            24 heures
          </MenuLink>
          <MenuLink
            onMouseOver={e => setBackgroundAsHovered(e)}
            onMouseOut={e => setBackgroundAsNotHovered(e)}
            style={menuLinkStyle(false, true)}
            onClick={() => ignoreAlert(ignoreAlertRequestFromMenu(IgnoreAlertPeriod.ONE_WEEK), id)}
          >
            1 semaine
          </MenuLink>
          <MenuLink
            onMouseOver={e => setBackgroundAsHovered(e)}
            onMouseOut={e => setBackgroundAsNotHovered(e)}
            style={menuLinkStyle(false, true)}
            onClick={() => ignoreAlert(ignoreAlertRequestFromMenu(IgnoreAlertPeriod.ONE_MONTH), id)}
          >
            1 mois
          </MenuLink>
          <MenuLink
            onMouseOver={e => setBackgroundAsHovered(e)}
            onMouseOut={e => setBackgroundAsNotHovered(e)}
            style={menuLinkStyle(false, true)}
            onClick={() => ignoreAlert(ignoreAlertRequestFromMenu(IgnoreAlertPeriod.ONE_YEAR), id)}
          >
            1 année
          </MenuLink>
          <MenuLink
            onMouseOver={e => setBackgroundAsHovered(e)}
            onMouseOut={e => setBackgroundAsNotHovered(e)}
            style={menuLinkStyle(false, true)}
            onClick={() => setCustomDatesModalIsOpen(true)}
          >
            Choisir une période précise
          </MenuLink>
        </>
        : <IgnoreAlertCustomPeriodModal
          containerRef={ignoreAlertRef}
          isModalOpen={customDatesModalIsOpen}
          setModalIsOpen={setCustomDatesModalIsOpen}
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
        />
    }
  </Wrapper>
}

const ignoreAlertRequestFromMenu = period => ({
  ignoreAlertPeriod: period,
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

export default IgnoreAlertMenu
