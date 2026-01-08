import { DatePicker, useNewWindow } from '@mtes-mct/monitor-ui'
import { type MutableRefObject, useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'

import { SilencedAlertPeriod } from '../../../constants'

import type { PendingAlert, SilencedAlertPeriodRequest } from '../../../types'
import type { Promisable } from 'type-fest'

// Constants
const MENU_WIDTH = 220
const DATE_RANGE_HEIGHT = 250
const MENU_HEIGHT = 360 + DATE_RANGE_HEIGHT
const MENU_GAP = 2
const VIEWPORT_PADDING = 10

// Menu items configuration
type MenuItem = {
  dataCy?: string
  label: string
  period: SilencedAlertPeriod
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Cette occurence', period: SilencedAlertPeriod.THIS_OCCURRENCE },
  { dataCy: 'side-window-silence-alert-one-hour', label: '1 heure', period: SilencedAlertPeriod.ONE_HOUR },
  { label: '2 heures', period: SilencedAlertPeriod.TWO_HOURS },
  { label: '6 heures', period: SilencedAlertPeriod.SIX_HOURS },
  { label: '12 heures', period: SilencedAlertPeriod.TWELVE_HOURS },
  { label: '24 heures', period: SilencedAlertPeriod.ONE_DAY },
  { label: '1 semaine', period: SilencedAlertPeriod.ONE_WEEK },
  { label: '1 mois', period: SilencedAlertPeriod.ONE_MONTH },
  { label: '1 année', period: SilencedAlertPeriod.ONE_YEAR }
]

// Helper function
const createSilenceRequest = (period: SilencedAlertPeriod): SilencedAlertPeriodRequest => ({
  beforeDateTime: null,
  silencedAlertPeriod: period
})

export type SilenceAlertMenuProps = {
  anchorElement: HTMLElement
  onClose: () => Promisable<void>
  pendingAlert: PendingAlert
  silenceAlert: (silencerAlertPeriodRequest: SilencedAlertPeriodRequest, pendingAlert: PendingAlert) => Promisable<void>
}
export function SilenceAlertMenu({ anchorElement, onClose, pendingAlert, silenceAlert }: SilenceAlertMenuProps) {
  const menuRef = useRef() as MutableRefObject<HTMLDivElement>
  const { newWindowContainerRef } = useNewWindow()

  const handleSilenceAlert = useCallback(
    (silencedAlertPeriodRequest: SilencedAlertPeriodRequest) => {
      silenceAlert(silencedAlertPeriodRequest, pendingAlert)
      onClose()
    },
    [onClose, pendingAlert, silenceAlert]
  )

  const selectDate = useCallback(
    (selectedDate: string | undefined) => {
      if (!selectedDate) {
        return
      }

      const silenceAlertPeriodRequest: SilencedAlertPeriodRequest = {
        beforeDateTime: new Date(selectedDate),
        silencedAlertPeriod: SilencedAlertPeriod.CUSTOM
      }

      handleSilenceAlert(silenceAlertPeriodRequest)
    },
    [handleSilenceAlert]
  )

  useEffect(() => {
    const ref = newWindowContainerRef.current

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuRef.current && !menuRef.current.contains(target) && !anchorElement?.contains(target)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    const timeoutId = setTimeout(() => {
      ref?.addEventListener('mousedown', handleClickOutside, true)
      ref?.addEventListener('keydown', handleEscape, true)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      ref?.removeEventListener('mousedown', handleClickOutside, true)
      ref?.removeEventListener('keydown', handleEscape, true)
    }
  }, [anchorElement, newWindowContainerRef, onClose])

  const getPosition = () => {
    if (!anchorElement) {
      return { left: 0, top: 0 }
    }

    const rect = anchorElement.getBoundingClientRect()
    let top = rect.bottom + MENU_GAP
    let left = rect.right - MENU_WIDTH

    // Check if menu would overflow left edge
    if (left < VIEWPORT_PADDING) {
      left = 0
    }

    // Check if menu would overflow bottom edge
    if (top + MENU_HEIGHT > (newWindowContainerRef.current?.clientHeight ?? 0)) {
      top = rect.top - MENU_HEIGHT + DATE_RANGE_HEIGHT - MENU_GAP
    }

    // Ensure top doesn't go negative
    if (top < VIEWPORT_PADDING) {
      top = 0
    }

    return { left, top }
  }

  const position = getPosition()

  if (!anchorElement || (!position.top && !position.left)) {
    return null
  }

  return (
    <Wrapper ref={menuRef} $left={position.left} $top={position.top}>
      <MenuHeader>Suspendre l&apos;alerte pour...</MenuHeader>
      {MENU_ITEMS.map(item => (
        <MenuLink
          key={item.period}
          data-cy={item.dataCy}
          onClick={() => handleSilenceAlert(createSilenceRequest(item.period))}
        >
          {item.label}
        </MenuLink>
      ))}
      <DatePickerWrapper>
        {newWindowContainerRef.current && (
          <DatePicker
            baseContainer={newWindowContainerRef.current}
            isHistorical={false}
            isLabelHidden
            isStringDate
            label="Date précise"
            name="silenceUntilDate"
            onChange={selectDate}
            withTime={false}
          />
        )}
      </DatePickerWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $left: number
  $top: number
}>`
  position: fixed;
  top: ${p => p.$top}px;
  left: ${p => p.$left}px;
  width: ${MENU_WIDTH}px;
  max-height: calc(100vh - ${p => p.$top}px - 20px);
  background: ${p => p.theme.color.white};
  box-shadow: 0 2px 8px ${p => p.theme.color.charcoalShadow};
  z-index: 999;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
`

const MenuHeader = styled.div`
  display: flex;
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.slateGray};
  cursor: default;
  height: 30px;
  padding: 8px 15px 0 15px;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 1;
`

const BaseMenuItem = styled.div`
  display: flex;
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.slateGray};
  border-bottom: 1px solid ${p => p.theme.color.lightGray};

  &:hover {
    background: ${p => p.theme.color.gainsboro};
  }
`

const MenuLink = styled(BaseMenuItem)`
  cursor: pointer;
  height: 25px;
  padding: 5px 15px 0 15px;
`

const DatePickerWrapper = styled(BaseMenuItem)`
  cursor: pointer;
  height: 25px;
  padding: 7px 15px;
`
