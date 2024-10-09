import { FingerprintSpinner } from '@components/FingerprintSpinner'
import { Summary } from '@features/Reporting/components/VesselReportingList/Summary'
import { getDefaultReportingsStartDate } from '@features/Reporting/utils'
import { useGetVesselReportingsByVesselIdentityQuery } from '@features/Vessel/vesselApi'
import { customDayjs, THEME } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useState } from 'react'
import styled from 'styled-components'

import { Archived } from './Archived'
import { VesselReportingListTab } from './constants'
import { Current } from './Current'

import type { VesselIdentity } from 'domain/entities/vessel/types'

type VesselReportingListProps = Readonly<{
  vesselIdentity: VesselIdentity | undefined
  withOpenedNewReportingForm?: boolean
  withTabs?: boolean
}>
export function VesselReportingList({
  vesselIdentity,
  withOpenedNewReportingForm = false,
  withTabs = false
}: VesselReportingListProps) {
  const [selectedTab, setSelectedTab] = useState<VesselReportingListTab>(VesselReportingListTab.CURRENT_REPORTING)
  const [startDate, setStartDate] = useState(getDefaultReportingsStartDate())

  const { data: vesselReportings } = useGetVesselReportingsByVesselIdentityQuery(
    vesselIdentity
      ? {
          fromDate: startDate.toISOString(),
          vesselIdentity
        }
      : skipToken
  )

  const decreaseStartDate = () => {
    setStartDate(customDayjs(startDate).subtract(5, 'year').toDate())
  }

  if (!vesselIdentity || !vesselReportings) {
    return <FingerprintSpinner className="radar" color={THEME.color.charcoal} size={100} />
  }

  return (
    <Body data-cy="vessel-reporting">
      {withTabs && (
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
      )}
      {selectedTab === VesselReportingListTab.CURRENT_REPORTING && (
        <Current
          vesselIdentity={vesselIdentity}
          vesselReportings={vesselReportings}
          withOpenedNewReportingForm={withOpenedNewReportingForm}
        />
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
  max-height: 670px;
  overflow-x: hidden;
  padding: 5px;
`
