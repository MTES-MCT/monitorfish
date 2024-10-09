import { FingerprintSpinner } from '@components/FingerprintSpinner'
import { Summary } from '@features/Reporting/components/VesselReportingList/Summary'
import { useGetVesselReportingsByVesselIdentityQuery } from '@features/Vessel/vesselApi'
import { THEME } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import styled from 'styled-components'

import { Archived } from './Archived'
import { VesselReportingListTab } from './constants'
import { Current } from './Current'

import type { VesselIdentity } from 'domain/entities/vessel/types'

type VesselReportingListProps = Readonly<{
  fromDate: string
  onTabChange?: (nextTab: VesselReportingListTab) => void
  selectedTab: VesselReportingListTab
  vesselIdentity: VesselIdentity | undefined
  withTabs?: boolean
}>
export function VesselReportingList({
  fromDate,
  onTabChange,
  selectedTab,
  vesselIdentity,
  withTabs = false
}: VesselReportingListProps) {
  const { data: vesselReportings } = useGetVesselReportingsByVesselIdentityQuery(
    vesselIdentity
      ? {
          fromDate,
          vesselIdentity
        }
      : skipToken
  )

  return (
    <>
      {!vesselReportings && <FingerprintSpinner className="radar" color={THEME.color.charcoal} size={100} />}
      {vesselReportings && (
        <Body data-cy="vessel-reporting">
          {withTabs && (
            <Menu>
              <CurrentOrHistoryButton
                $isActive={selectedTab === VesselReportingListTab.CURRENT_REPORTING}
                onClick={() => (onTabChange ? onTabChange(VesselReportingListTab.CURRENT_REPORTING) : undefined)}
              >
                Signalements en cours ({vesselReportings.current.length})
              </CurrentOrHistoryButton>
              <CurrentOrHistoryButton
                $isActive={selectedTab === VesselReportingListTab.REPORTING_HISTORY}
                data-cy="vessel-sidebar-reporting-tab-history-button"
                onClick={() => (onTabChange ? onTabChange(VesselReportingListTab.REPORTING_HISTORY) : undefined)}
              >
                Historique des signalements
              </CurrentOrHistoryButton>
            </Menu>
          )}
          {selectedTab === VesselReportingListTab.CURRENT_REPORTING && <Current />}
          {selectedTab === VesselReportingListTab.REPORTING_HISTORY && (
            <>
              <Summary />
              <Archived />
            </>
          )}
        </Body>
      )}
    </>
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
  margin: 5px;
  border: 1px solid ${p => p.theme.color.charcoal};
  display: flex;
  width: 480px;
`

const Body = styled.div`
  padding: 5px;
  overflow-x: hidden;
  max-height: 670px;
`
