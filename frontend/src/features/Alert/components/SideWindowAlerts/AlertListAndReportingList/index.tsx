import { filterBySeafrontGroup, SeafrontGroup } from '@constants/seafront'
import { ReportingTable } from '@features/Reporting/components/ReportingTable'
import { Header } from '@features/SideWindow/components/Header'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useMemo } from 'react'
import styled from 'styled-components'

import { AlertAndReportingTab } from './constants'
import { PendingAlertsList } from './PendingAlertsList'
import { setSelectedTab } from '../slice'

type AlertListAndReportingListProps = {
  isFromUrl: boolean
  selectedSeafrontGroup: SeafrontGroup
}
export function AlertListAndReportingList({ isFromUrl, selectedSeafrontGroup }: AlertListAndReportingListProps) {
  const dispatch = useMainAppDispatch()
  const selectedTab = useMainAppSelector(state => state.alert.selectedTab)
  const silencedAlerts = useMainAppSelector(state => state.alert.silencedAlerts)

  const filteredSilencedAlerts = useMemo(
    () => filterBySeafrontGroup(silencedAlerts, selectedSeafrontGroup, a => a.value.seaFront),
    [silencedAlerts, selectedSeafrontGroup]
  )

  return (
    <Wrapper>
      <StyledHeader>
        <Title
          $isSelected={selectedTab === AlertAndReportingTab.ALERT}
          onClick={() => dispatch(setSelectedTab(AlertAndReportingTab.ALERT))}
        >
          Alertes
        </Title>
        <Title
          $isSelected={selectedTab === AlertAndReportingTab.REPORTING}
          data-cy="side-window-reporting-tab"
          onClick={() => dispatch(setSelectedTab(AlertAndReportingTab.REPORTING))}
        >
          Signalements
        </Title>
      </StyledHeader>

      {selectedTab === AlertAndReportingTab.ALERT && (
        <PendingAlertsList
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
