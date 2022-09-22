import { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { AlertsMenuSeaFrontsToSeaFrontList, AlertsSubMenu } from '../../../domain/entities/alerts'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { AlertAndReportingTab } from '../constants'
import { PendingAlertsList } from './PendingAlertsList'
import { ReportingList } from './ReportingList'
import { SilencedAlertsList } from './SilencedAlertsList'

import type { PendingAlert } from '../../../domain/types/alert'
import type { MenuItem } from '../types'

type AlertsAndReportingsProps = {
  baseRef: any
  selectedSubMenu: MenuItem
  selectedTab: any
  setSelectedSubMenu: any
  setSelectedTab: any
}
export function AlertsAndReportings({
  baseRef,
  selectedSubMenu,
  selectedTab,
  setSelectedSubMenu,
  setSelectedTab
}: AlertsAndReportingsProps) {
  const { focusOnAlert, silencedAlerts } = useAppSelector(state => state.alert)

  const silencedSeaFrontAlerts = useMemo(
    () =>
      silencedAlerts.filter(alert =>
        (AlertsMenuSeaFrontsToSeaFrontList[selectedSubMenu.code]
          ? AlertsMenuSeaFrontsToSeaFrontList[selectedSubMenu.code].seaFronts
          : []
        ).includes(
          // TODO Remove the `as` as soon as the discriminator is added.
          (alert.value as PendingAlert).seaFront
        )
      ),
    [silencedAlerts, selectedSubMenu]
  )

  useEffect(() => {
    if (focusOnAlert) {
      // TODO Remove the `as` as soon as the discriminator is added.
      const { seaFront } = focusOnAlert.value as PendingAlert

      const menuSeaFrontName = Object.keys(AlertsMenuSeaFrontsToSeaFrontList)
        .map(menuSeaFrontKey => AlertsMenuSeaFrontsToSeaFrontList[menuSeaFrontKey])
        .find(item => item.seaFronts.includes(seaFront))

      if (menuSeaFrontName) {
        setSelectedSubMenu(AlertsSubMenu[menuSeaFrontName.menuSeaFront])
      }
    }
  }, [focusOnAlert, setSelectedSubMenu])

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
            numberOfSilencedAlerts={silencedSeaFrontAlerts.length}
            selectedSubMenu={selectedSubMenu}
          />
          <SilencedAlertsList silencedSeaFrontAlerts={silencedSeaFrontAlerts} />
        </>
      )}
      {selectedTab === AlertAndReportingTab.REPORTING && <ReportingList selectedSubMenu={selectedSubMenu} />}
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
