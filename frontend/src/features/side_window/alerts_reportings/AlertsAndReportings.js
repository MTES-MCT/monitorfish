import React, { useEffect, useMemo } from 'react'
import PendingAlertsList from './PendingAlertsList'
import { useSelector } from 'react-redux'
import { AlertsMenuSeaFrontsToSeaFrontList, AlertsSubMenu } from '../../../domain/entities/alerts'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import SilencedAlertsList from './SilencedAlertsList'
import { ReportingList } from './ReportingList'
import { AlertAndReportingTab } from '../SideWindow'

/**
 * @param selectedSubMenu
 * @param setSelectedSubMenu
 * @param selectedTab
 * @param setSelectedTab
 * @param baseRef
 * @return {JSX.Element}
 * @constructor
 */
const AlertsAndReportings = ({ selectedSubMenu, setSelectedSubMenu, selectedTab, setSelectedTab, baseRef }) => {
  const {
    silencedAlerts,
    focusOnAlert
  } = useSelector(state => state.alert)

  const silencedSeaFrontAlerts = useMemo(() => {
    return silencedAlerts
      .filter(alert => (AlertsMenuSeaFrontsToSeaFrontList[selectedSubMenu?.code]?.seaFronts || []).includes(alert.value.seaFront))
  }, [silencedAlerts, selectedSubMenu])

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

  return <>
    <Title
      onClick={() => setSelectedTab(AlertAndReportingTab.ALERT)}
      isSelected={selectedTab === AlertAndReportingTab.ALERT}
    >
      Alertes
    </Title>
    <Title
      onClick={() => setSelectedTab(AlertAndReportingTab.REPORTING)}
      isSelected={selectedTab === AlertAndReportingTab.REPORTING}
    >
      Signalements
    </Title>
    {
      selectedTab === AlertAndReportingTab.ALERT && <>
        <PendingAlertsList
          seaFront={selectedSubMenu}
          numberOfSilencedAlerts={silencedSeaFrontAlerts.length}
          baseRef={baseRef}
        />
        <SilencedAlertsList
          silencedSeaFrontAlerts={silencedSeaFrontAlerts}
        />
      </>
    }
    {
      selectedTab === AlertAndReportingTab.REPORTING && <>
        <ReportingList
          seaFront={selectedSubMenu}
        />
      </>
    }
  </>
}

const Title = styled.h2`
  margin: 30px 10px 30px 10px;
  font-size: 22px;
  color: ${COLORS.gunMetal};
  border-bottom: 5px solid ${p => p.isSelected ? COLORS.charcoal : COLORS.white};
  font-weight: 700;
  text-align: left;
  padding-bottom: 5px;
  width: fit-content;
  display: inline-block;
  cursor: pointer;
  transition: all 0.2s;
`

export default AlertsAndReportings
