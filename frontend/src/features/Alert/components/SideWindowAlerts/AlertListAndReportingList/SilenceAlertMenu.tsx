import { useClickOutsideWhenOpenedWithinRef } from '@hooks/useClickOutsideWhenOpenedWithinRef'
import { useForceUpdate } from '@hooks/useForceUpdate'
import { THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useRef } from 'react'
import DatePicker from 'rsuite/DatePicker'
import { beforeToday } from 'rsuite/esm/DateRangePicker/disabledDateUtils'
import styled from 'styled-components'

import { SilencedAlertPeriod } from '../../../constants'

import type { PendingAlert, SilencedAlertPeriodRequest } from '../../../types'
import type { CSSProperties, MutableRefObject } from 'react'
import type { Promisable } from 'type-fest'

const DATE_RANGE_PICKER_LOCALE = {
  friday: 'Ve',
  last7Days: '7 derniers jours',
  monday: 'Lu',
  ok: 'OK',
  saturday: 'Sa',
  sunday: 'Di',
  thursday: 'Je',
  today: "Aujourd'hui",
  tuesday: 'Ma',
  wednesday: 'Me',
  yesterday: 'Hier'
}

export type SilenceAlertMenuProps = {
  baseRef: any
  pendingAlert: PendingAlert
  pendingAlertIndex: number
  scrollableContainer: MutableRefObject<HTMLDivElement>
  setSilenceAlertMenuDisplayedFor: (
    silenceAlertMenuDisplayedFor: { index: number; pendingAlert: PendingAlert } | undefined
  ) => Promisable<void>
  silenceAlert: (silencerAlertPeriodRequest: SilencedAlertPeriodRequest, pendingAlert: PendingAlert) => Promisable<void>
}
/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 */
export function SilenceAlertMenu({
  baseRef,
  pendingAlert,
  pendingAlertIndex,
  scrollableContainer,
  setSilenceAlertMenuDisplayedFor,
  silenceAlert
}: SilenceAlertMenuProps) {
  const silencedAlertRef = useRef() as MutableRefObject<HTMLDivElement>
  const clickedOutside = useClickOutsideWhenOpenedWithinRef(silencedAlertRef, pendingAlertIndex, baseRef)
  const { forceUpdate } = useForceUpdate()

  useEffect(() => {
    forceUpdate()
  }, [forceUpdate])

  useEffect(() => {
    if (clickedOutside) {
      setSilenceAlertMenuDisplayedFor(undefined)
    }
  }, [clickedOutside, setSilenceAlertMenuDisplayedFor])

  const selectDate = useCallback(
    (selectedDate: Date) => {
      if (!selectedDate) {
        return
      }

      const silenceAlertPeriodRequest: SilencedAlertPeriodRequest = {
        beforeDateTime: selectedDate,
        silencedAlertPeriod: SilencedAlertPeriod.CUSTOM
      }

      silenceAlert(silenceAlertPeriodRequest, pendingAlert)
    },
    [pendingAlert, silenceAlert]
  )

  return (
    <Wrapper
      ref={silencedAlertRef}
      style={silenceMenuStyle(pendingAlertIndex, scrollableContainer?.current.scrollTop || 0)}
    >
      <>
        <MenuLink style={menuLinkStyle(true, false)}>Suspendre l’alerte pour...</MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.THIS_OCCURRENCE), pendingAlert)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          Cette occurence
        </MenuLink>
        <MenuLink
          data-cy="side-window-silence-alert-one-hour"
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.ONE_HOUR), pendingAlert)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          1 heure
        </MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.TWO_HOURS), pendingAlert)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          2 heures
        </MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.SIX_HOURS), pendingAlert)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          6 heures
        </MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.TWELVE_HOURS), pendingAlert)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          12 heures
        </MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.ONE_DAY), pendingAlert)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          24 heures
        </MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.ONE_WEEK), pendingAlert)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          1 semaine
        </MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.ONE_MONTH), pendingAlert)}
          onMouseOut={e => setBackgroundAsNotHovered(e)}
          onMouseOver={e => setBackgroundAsHovered(e)}
          style={menuLinkStyle(false, true)}
        >
          1 mois
        </MenuLink>
        <MenuLink
          onClick={() => silenceAlert(silenceAlertRequestFromMenu(SilencedAlertPeriod.ONE_YEAR), pendingAlert)}
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
  e.currentTarget.style.background = THEME.color.gainsboro
}

function setBackgroundAsNotHovered(e) {
  e.currentTarget.style.background = THEME.color.white
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
  background: THEME.color.white,
  borderBottom: `${withBottomLine ? 1 : 0}px solid ${THEME.color.lightGray}`,
  color: THEME.color.slateGray,
  cursor: hasLink ? 'pointer' : 'unset',
  display: 'flex',
  height: 25,
  padding: isCalendar ? '7px 15px 7px 15px' : '5px 15px 0px 15px'
})
