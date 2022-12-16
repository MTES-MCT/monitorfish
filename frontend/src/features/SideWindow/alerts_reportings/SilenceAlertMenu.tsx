import { THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useRef } from 'react'
import DatePicker from 'rsuite/DatePicker'
import { beforeToday } from 'rsuite/esm/DateRangePicker/disabledDateUtils'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { SilencedAlertPeriod } from '../../../domain/entities/alerts/constants'
import { useClickOutsideWhenOpenedWithinRef } from '../../../hooks/useClickOutsideWhenOpenedWithinRef'
import { useForceUpdate } from '../../../hooks/useForceUpdate'
import { DATE_RANGE_PICKER_LOCALE } from '../../vessel_sidebar/actions/TrackRequest/DateRange'

import type { SilencedAlertPeriodRequest } from '../../../domain/entities/alerts/types'
import type { CSSProperties, MutableRefObject } from 'react'
import type { Promisable } from 'type-fest'

export type SilenceAlertMenuProps = {
  baseRef: any
  id: string
  scrollableContainer: MutableRefObject<HTMLDivElement>
  setShowSilencedAlertForIndex: (index?: number) => Promisable<void>
  showSilencedAlertForIndex: number
  silenceAlert: (silencerAlerPeriodtRequest: SilencedAlertPeriodRequest, id: string) => Promisable<void>
}
/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 */
export function SilenceAlertMenu({
  baseRef,
  id,
  scrollableContainer,
  setShowSilencedAlertForIndex,
  showSilencedAlertForIndex,
  silenceAlert
}: SilenceAlertMenuProps) {
  const silencedAlertRef = useRef() as MutableRefObject<HTMLDivElement>
  const clickedOutside = useClickOutsideWhenOpenedWithinRef(silencedAlertRef, showSilencedAlertForIndex, baseRef)
  const { forceUpdate } = useForceUpdate()

  useEffect(() => {
    forceUpdate()
  }, [forceUpdate])

  useEffect(() => {
    if (clickedOutside) {
      setShowSilencedAlertForIndex()
    }
  }, [clickedOutside, setShowSilencedAlertForIndex])

  const selectDate = useCallback(
    (selectedDate: Date) => {
      if (!selectedDate) {
        return
      }

      setShowSilencedAlertForIndex()

      const silenceAlertPeriodRequest: SilencedAlertPeriodRequest = {
        beforeDateTime: selectedDate,
        silencedAlertPeriod: SilencedAlertPeriod.CUSTOM
      }

      silenceAlert(silenceAlertPeriodRequest, id)
    },
    [id, setShowSilencedAlertForIndex, silenceAlert]
  )

  return (
    <Wrapper
      ref={silencedAlertRef}
      style={silenceMenuStyle(showSilencedAlertForIndex, scrollableContainer?.current.scrollTop || 0)}
    >
      <>
        <MenuLink style={menuLinkStyle(true, false)}>Ignorer l’alerte pour...</MenuLink>
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
          {silencedAlertRef.current && (
            <DatePicker
              cleanable
              container={silencedAlertRef.current}
              // @ts-ignore
              disabledDate={beforeToday()}
              format="dd-MM-yyyy"
              locale={DATE_RANGE_PICKER_LOCALE}
              onOk={selectDate}
              placeholder="Date précise"
              placement="auto"
              size="sm"
            />
          )}
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
  e.currentTarget.style.background = COLORS.white
}

const Wrapper = styled.div``
const silenceMenuStyle = (index: number, scrollY: number): CSSProperties => ({
  boxShadow: `1px 2px 5px ${THEME.color.charcoalShadow}`,
  marginLeft: 940,
  marginTop: 35 + index * 49 - scrollY,
  position: 'absolute',
  top: 0,
  width: 220,
  zIndex: 999
})

const MenuLink = styled.span``
const menuLinkStyle = (withBottomLine: boolean, hasLink: boolean, isCalendar: boolean = false): CSSProperties => ({
  background: COLORS.white,
  borderBottom: `${withBottomLine ? 1 : 0}px solid ${COLORS.lightGray}`,
  color: COLORS.slateGray,
  cursor: hasLink ? 'pointer' : 'unset',
  display: 'flex',
  height: 25,
  padding: isCalendar ? '7px 15px 7px 15px' : '5px 15px 0px 15px'
})
