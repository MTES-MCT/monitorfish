import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { FingerprintSpinner } from '@components/FingerprintSpinner'
import { VesselReportingList } from '@features/Reporting/components/VesselReportingList'
import { getDefaultReportingsStartDate } from '@features/Reporting/utils'
import { Summary } from '@features/Vessel/components/VesselSidebar/ReportingList/Summary'
import { useGetVesselReportingsByVesselIdentityQuery } from '@features/Vessel/vesselApi'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customDayjs, THEME, useKey } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useState } from 'react'
import styled from 'styled-components'

import { Archived } from './Archived'
import { VesselReportingListTab } from './constants'

export function ReportingList() {
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const selectedVesselSidebarReportingListTab = useMainAppSelector(
    state => state.vessel.selectedVesselSidebarReportingListTab
  )
  const key = useKey([selectedVesselIdentity, selectedVesselSidebarReportingListTab])

  const [selectedTab, setSelectedTab] = useState<VesselReportingListTab>(
    selectedVesselSidebarReportingListTab ?? VesselReportingListTab.CURRENT_REPORTING
  )
  const [startDate, setStartDate] = useState(getDefaultReportingsStartDate())

  const { data: vesselReportings } = useGetVesselReportingsByVesselIdentityQuery(
    selectedVesselIdentity
      ? {
          fromDate: startDate.toISOString(),
          vesselIdentity: selectedVesselIdentity
        }
      : skipToken,
    RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS
  )

  const decreaseStartDate = () => {
    setStartDate(customDayjs(startDate).subtract(1, 'year').toDate())
  }

  if (!selectedVesselIdentity || !vesselReportings) {
    return <FingerprintSpinner className="radar" color={THEME.color.charcoal} size={100} />
  }

  return (
    <Body
      // This key resets the default tab when `selectedVesselIdentity` changes
      key={key}
      data-cy="vessel-reporting"
    >
      <Menu>
        <CurrentOrHistoryButton
          $isActive={selectedTab === VesselReportingListTab.CURRENT_REPORTING}
          onClick={() => setSelectedTab(VesselReportingListTab.CURRENT_REPORTING)}
        >
          Signalements en cours ({vesselReportings.current.length})
        </CurrentOrHistoryButton>
        <CurrentOrHistoryButton
          $isActive={selectedTab === VesselReportingListTab.REPORTING_HISTORY}
          data-cy="vessel-sidebar-reporting-tab-history-button"
          onClick={() => setSelectedTab(VesselReportingListTab.REPORTING_HISTORY)}
        >
          Historique des signalements
        </CurrentOrHistoryButton>
      </Menu>

      {selectedTab === VesselReportingListTab.CURRENT_REPORTING && (
        <VesselReportingList startDate={startDate} vesselIdentity={selectedVesselIdentity} />
      )}
      {selectedTab === VesselReportingListTab.REPORTING_HISTORY && (
        <>
          <Summary fromDate={startDate} vesselReportings={vesselReportings} />
          <Archived fromDate={startDate} onMore={decreaseStartDate} vesselReportings={vesselReportings} />
        </>
      )}
    </Body>
  )
}

const CurrentOrHistoryButton = styled.div<{
  $isActive: boolean
}>`
  background: ${p => (p.$isActive ? p.theme.color.charcoal : 'unset')};
  color: ${p => (p.$isActive ? p.theme.color.gainsboro : p.theme.color.gunMetal)};
  cursor: pointer;
  flex-grow: 1;
  padding: 6px 0 8px 0;
  text-align: center;
  user-select: none;
`

const Menu = styled.div`
  border: 1px solid ${p => p.theme.color.charcoal};
  display: flex;
  margin: 5px;
  width: 480px;
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-x: hidden;
  padding: 5px;

  > .Element-LinkButton {
    margin-left: 21px;
  }
`
