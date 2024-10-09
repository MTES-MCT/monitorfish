import { FingerprintSpinner } from '@components/FingerprintSpinner'
import { Summary } from '@features/Reporting/components/CardReportingList/Summary'
import { useGetVesselReportingsByVesselIdentityQuery } from '@features/Vessel/vesselApi'
import { THEME } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import styled from 'styled-components'

import { Archived } from './Archived'
import { ReportingTab } from './constants'
import { Current } from './Current'

import type { VesselIdentity } from 'domain/entities/vessel/types'

type CardReportingListProp = Readonly<{
  fromDate: string
  onTabChange?: (nextTab: ReportingTab) => void
  selectedReportingTab: ReportingTab
  vesselIdentity: VesselIdentity | undefined
  withTabs?: boolean
}>
export function CardReportingList({
  fromDate,
  onTabChange,
  selectedReportingTab,
  vesselIdentity,
  withTabs = false
}: CardReportingListProp) {
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
                $isActive={selectedReportingTab === ReportingTab.CURRENT_REPORTING}
                onClick={() => (onTabChange ? onTabChange(ReportingTab.CURRENT_REPORTING) : undefined)}
              >
                Signalements en cours ({vesselReportings.current.length})
              </CurrentOrHistoryButton>
              <CurrentOrHistoryButton
                $isActive={selectedReportingTab === ReportingTab.REPORTING_HISTORY}
                data-cy="vessel-sidebar-reporting-tab-history-button"
                onClick={() => (onTabChange ? onTabChange(ReportingTab.REPORTING_HISTORY) : undefined)}
              >
                Historique des signalements
              </CurrentOrHistoryButton>
            </Menu>
          )}
          {selectedReportingTab === ReportingTab.CURRENT_REPORTING && <Current />}
          {selectedReportingTab === ReportingTab.REPORTING_HISTORY && (
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
