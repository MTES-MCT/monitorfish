import { propEq } from 'ramda'
import { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import {
  ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS,
  ALERTS_SUBMENU,
  SeaFront
} from '../../../domain/entities/alerts/constants'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { AlertAndReportingTab } from '../constants'
import { PendingAlertsList } from './PendingAlertsList'
import { ReportingList } from './ReportingList'
import { SilencedAlertsList } from './SilencedAlertsList'

import type { MenuItem } from '../../../types'
import type { ForwardedRef } from 'react'
import type { Promisable } from 'type-fest'

type AlertsAndReportingsProps = {
  baseRef: ForwardedRef<HTMLDivElement>
  selectedSubMenu: MenuItem<SeaFront>
  selectedTab: any
  // TODO Change this param to only use the `SeaFront` enum.
  setSelectedSeaFront: (nextSeaFront: SeaFront) => Promisable<void>
  setSelectedTab: any
}
export function AlertsAndReportings({
  baseRef,
  selectedSubMenu,
  selectedTab,
  setSelectedSeaFront,
  setSelectedTab
}: AlertsAndReportingsProps) {
  const { focusedPendingAlertId, pendingAlerts, silencedAlerts } = useAppSelector(state => state.alert)

  const filteredSilencedAlerts = useMemo(
    () =>
      silencedAlerts.filter(silencedAlert =>
        (ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS[selectedSubMenu.code]
          ? ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS[selectedSubMenu.code].seaFronts
          : []
        ).includes(silencedAlert.value.seaFront)
      ),
    [silencedAlerts, selectedSubMenu]
  )

  useEffect(() => {
    if (!focusedPendingAlertId) {
      return
    }

    const focusedPendingAlert = pendingAlerts.find(propEq('id', focusedPendingAlertId))
    if (!focusedPendingAlert) {
      return
    }
    // TODO Remove the `as` as soon as the discriminator is added.
    const { seaFront } = focusedPendingAlert.value

    const menuSeaFrontName = Object.keys(ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS)
      .map(menuSeaFrontKey => ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS[menuSeaFrontKey])
      .find(item => item.seaFronts.includes(seaFront))

    if (menuSeaFrontName) {
      setSelectedSeaFront(ALERTS_SUBMENU[menuSeaFrontName.menuSeaFront])
    }
  }, [focusedPendingAlertId, pendingAlerts, setSelectedSeaFront])

  return (
    <>
      <Title
        isSelected={selectedTab === AlertAndReportingTab.ALERT}
        onClick={() => setSelectedTab(AlertAndReportingTab.ALERT)}
      >
        Alertes
      </Title>
      <Title
        data-cy="side-window-reporting-tab"
        isSelected={selectedTab === AlertAndReportingTab.REPORTING}
        onClick={() => setSelectedTab(AlertAndReportingTab.REPORTING)}
      >
        Signalements
      </Title>
      {selectedTab === AlertAndReportingTab.ALERT && (
        <>
          <PendingAlertsList
            baseRef={baseRef}
            numberOfSilencedAlerts={filteredSilencedAlerts.length}
            selectedSeaFront={selectedSubMenu}
          />
          <SilencedAlertsList silencedAlerts={filteredSilencedAlerts} />
        </>
      )}
      {selectedTab === AlertAndReportingTab.REPORTING && <ReportingList selectedSeaFront={selectedSubMenu} />}
    </>
  )
}

const Title = styled.h2<{
  isSelected: boolean
}>`
  margin: 30px 10px 30px 10px;
  font-size: 22px;
  color: ${COLORS.gunMetal};
  border-bottom: 5px solid ${p => (p.isSelected ? COLORS.charcoal : COLORS.white)};
  font-weight: 700;
  text-align: left;
  padding-bottom: 5px;
  width: fit-content;
  display: inline-block;
  cursor: pointer;
  transition: all 0.2s;
`
