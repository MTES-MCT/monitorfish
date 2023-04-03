import { useMemo } from 'react'
import styled from 'styled-components'

import { PendingAlertsList } from './PendingAlertsList'
import { ReportingList } from './ReportingList'
import { SilencedAlertsList } from './SilencedAlertsList'
import { SeaFrontGroup, SEA_FRONT_GROUP_SEA_FRONTS } from '../../../constants'
import { COLORS } from '../../../constants/constants'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { AlertAndReportingTab } from '../constants'

import type { RefObject } from 'react'

type AlertsAndReportingsProps = {
  baseRef: RefObject<HTMLDivElement>
  selectedSubMenu: SeaFrontGroup
  selectedTab: any
  setSelectedTab: any
}
export function AlertsAndReportings({
  baseRef,
  selectedSubMenu,
  selectedTab,
  setSelectedTab
}: AlertsAndReportingsProps) {
  const { silencedAlerts } = useMainAppSelector(state => state.alert)

  const filteredSilencedAlerts = useMemo(
    () =>
      silencedAlerts.filter(silencedAlert =>
        (SEA_FRONT_GROUP_SEA_FRONTS[selectedSubMenu] || []).includes(silencedAlert.value.seaFront)
      ),
    [silencedAlerts, selectedSubMenu]
  )

  return (
    <Wrapper>
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
            selectedSeaFrontGroup={selectedSubMenu}
          />
          <SilencedAlertsList silencedAlerts={filteredSilencedAlerts} />
        </>
      )}
      {selectedTab === AlertAndReportingTab.REPORTING && <ReportingList selectedSeaFrontGroup={selectedSubMenu} />}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  flex-grow: 1;
  overflow: auto;
`

const Title = styled.h2<{
  isSelected: boolean
}>`
  border-bottom: 5px solid ${p => (p.isSelected ? COLORS.charcoal : COLORS.white)};
  color: ${COLORS.gunMetal};
  cursor: pointer;
  display: inline-block;
  font-size: 22px;
  font-weight: 700;
  margin: 30px 10px;
  padding-bottom: 5px;
  text-align: left;
  transition: all 0.2s;
  width: fit-content;
`
