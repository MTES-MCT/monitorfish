import { WindowContext } from '@api/constants'
import { SeafrontGroup } from '@constants/seafront'
import { useGetReportingsQuery } from '@features/Reporting/reportingApi'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { useMemo } from 'react'
import styled from 'styled-components'

import { AlertAndReportingTab } from './constants'
import { PendingAlertsList } from './PendingAlertsList'
import { ALERTS_MENU_SEAFRONT_TO_SEAFRONTS } from '../../../../domain/entities/alerts/constants'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { ReportingList } from '../../../Reporting/components/ReportingList'

import type { RefObject } from 'react'

type AlertListAndReportingListProps = {
  baseRef: RefObject<HTMLDivElement>
  selectedSeafrontGroup: SeafrontGroup
  selectedTab: any
  setSelectedTab: any
}
export function AlertListAndReportingList({
  baseRef,
  selectedSeafrontGroup,
  selectedTab,
  setSelectedTab
}: AlertListAndReportingListProps) {
  const displayedError = useMainAppSelector(
    state => state.displayedError[DisplayedErrorKey.SIDE_WINDOW_REPORTING_LIST_ERROR]
  )
  const silencedAlerts = useMainAppSelector(state => state.alert.silencedAlerts)

  const { data: currentReportings } = useGetReportingsQuery()

  const filteredSilencedAlerts = useMemo(
    () =>
      silencedAlerts.filter(silencedAlert => {
        const seafronts = ALERTS_MENU_SEAFRONT_TO_SEAFRONTS[selectedSeafrontGroup]
          ? ALERTS_MENU_SEAFRONT_TO_SEAFRONTS[selectedSeafrontGroup].seafronts
          : []

        return silencedAlert.value.seaFront && seafronts.includes(silencedAlert.value.seaFront)
      }),
    [silencedAlerts, selectedSeafrontGroup]
  )

  return (
    <Wrapper>
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

      {selectedTab === AlertAndReportingTab.ALERT && (
        <>
          <PendingAlertsList
            baseRef={baseRef}
            numberOfSilencedAlerts={filteredSilencedAlerts.length}
            selectedSeafrontGroup={selectedSeafrontGroup}
          />
        </>
      )}
      {selectedTab === AlertAndReportingTab.REPORTING && (
        <ReportingList
          currentReportings={currentReportings ?? []}
          displayedError={displayedError}
          selectedSeafrontGroup={selectedSeafrontGroup}
          windowContext={WindowContext.SideWindow}
        />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  flex-grow: 1;
  overflow: auto;
  margin-left: 30px;
`

// TODO This should be a `<a />` or a `<button />`.
const Title = styled.h2<{
  $isSelected: boolean
}>`
  border-bottom: 5px solid ${p => (p.$isSelected ? p.theme.color.charcoal : p.theme.color.white)};
  color: ${p => p.theme.color.gunMetal};
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
