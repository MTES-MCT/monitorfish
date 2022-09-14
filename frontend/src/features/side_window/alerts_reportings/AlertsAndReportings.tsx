import React, { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { AlertsMenuSeaFrontsToSeaFrontList, AlertsSubMenu } from '../../../domain/entities/alerts'
import { AlertAndReportingTab } from '../SideWindow'
import PendingAlertsList from './PendingAlertsList'
import { ReportingList } from './ReportingList'
import SilencedAlertsList from './SilencedAlertsList'

/**
 * @param selectedSubMenu
 * @param setSelectedSubMenu
 * @param selectedTab
 * @param setSelectedTab
 * @param baseRef
 * @return {JSX.Element}
 * @constructor
 */
function AlertsAndReportings({ baseRef, selectedSubMenu, selectedTab, setSelectedSubMenu, setSelectedTab }) {
  const { focusOnAlert, silencedAlerts } = useSelector(state => state.alert)

  const silencedSeaFrontAlerts = useMemo(
    () =>
      silencedAlerts.filter(alert =>
        (AlertsMenuSeaFrontsToSeaFrontList[selectedSubMenu?.code]?.seaFronts || []).includes(alert.value.seaFront)
      ),
    [silencedAlerts, selectedSubMenu]
  )

  useEffect(() => {
    if (focusOnAlert) {
      const seaFront = focusOnAlert?.value?.seaFront

      const menuSeaFrontName = Object.keys(AlertsMenuSeaFrontsToSeaFrontList)
        .map(menuSeaFrontKey => AlertsMenuSeaFrontsToSeaFrontList[menuSeaFrontKey])
        .find(item => item.seaFronts.includes(seaFront))

      if (menuSeaFrontName) {
        setSelectedSubMenu(AlertsSubMenu[menuSeaFrontName.menuSeaFront])
      }
    }
  }, [focusOnAlert])

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
            seaFront={selectedSubMenu}
          />
          <SilencedAlertsList silencedSeaFrontAlerts={silencedSeaFrontAlerts} />
        </>
      )}
      {selectedTab === AlertAndReportingTab.REPORTING && <ReportingList seaFront={selectedSubMenu} />}
    </>
  )
}

const Title = styled.h2`
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

export default AlertsAndReportings
