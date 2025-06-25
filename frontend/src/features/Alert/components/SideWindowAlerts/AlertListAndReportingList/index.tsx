import { NO_SEAFRONT_GROUP, type NoSeafrontGroup, SeafrontGroup } from '@constants/seafront'
import { ReportingTable } from '@features/Reporting/components/ReportingTable'
import { Header } from '@features/SideWindow/components/Header'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useMemo } from 'react'
import styled from 'styled-components'

import { AlertAndReportingTab } from './constants'
import { PendingAlertsList } from './PendingAlertsList'
import { ALERTS_MENU_SEAFRONT_TO_SEAFRONTS } from '../../../constants'

import type { RefObject } from 'react'

type AlertListAndReportingListProps = {
  baseRef: RefObject<HTMLDivElement>
  isFromUrl: boolean
  selectedSeafrontGroup: SeafrontGroup | NoSeafrontGroup
  selectedTab: any
  setSelectedTab: any
}
export function AlertListAndReportingList({
  baseRef,
  isFromUrl,
  selectedSeafrontGroup,
  selectedTab,
  setSelectedTab
}: AlertListAndReportingListProps) {
  const silencedAlerts = useMainAppSelector(state => state.alert.silencedAlerts)

  const filteredSilencedAlerts = useMemo(() => {
    if (selectedSeafrontGroup === NO_SEAFRONT_GROUP) {
      return silencedAlerts.filter(silencedAlert => !silencedAlert.value.seaFront)
    }

    return silencedAlerts.filter(silencedAlert => {
      const seafronts = ALERTS_MENU_SEAFRONT_TO_SEAFRONTS[selectedSeafrontGroup]
        ? ALERTS_MENU_SEAFRONT_TO_SEAFRONTS[selectedSeafrontGroup].seafronts
        : []

      return silencedAlert.value.seaFront && seafronts.includes(silencedAlert.value.seaFront)
    })
  }, [silencedAlerts, selectedSeafrontGroup])

  return (
    <Wrapper>
      <StyledHeader>
        <Title
          $isSelected={selectedTab === AlertAndReportingTab.ALERT}
          onClick={() => setSelectedTab(AlertAndReportingTab.ALERT)}
        >
          Alertes
        </Title>
        <Title
          $isSelected={selectedTab === AlertAndReportingTab.REPORTING}
          data-cy="side-window-reporting-tab"
          onClick={() => setSelectedTab(AlertAndReportingTab.REPORTING)}
        >
          Signalements
        </Title>
      </StyledHeader>

      {selectedTab === AlertAndReportingTab.ALERT && (
        <PendingAlertsList
          baseRef={baseRef}
          numberOfSilencedAlerts={filteredSilencedAlerts.length}
          selectedSeafrontGroup={selectedSeafrontGroup}
        />
      )}
      {selectedTab === AlertAndReportingTab.REPORTING && (
        <ReportingTable isFromUrl={isFromUrl} selectedSeafrontGroup={selectedSeafrontGroup} />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  flex-grow: 1;
  overflow: auto;
`

const StyledHeader = styled(Header)`
  display: inline-block;
`

const Title = styled(Header.Title)<{
  $isSelected: boolean
}>`
  border-bottom: 5px solid ${p => (p.$isSelected ? p.theme.color.charcoal : p.theme.color.white)};
  cursor: pointer;
  width: fit-content;
  display: inline-block;
  margin-right: 50px;
  height: 38px;
`
