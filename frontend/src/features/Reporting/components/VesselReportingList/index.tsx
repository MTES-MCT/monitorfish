import { FingerprintSpinner } from '@components/FingerprintSpinner'
import { Summary } from '@features/Reporting/components/VesselReportingList/Summary'
import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { Archived } from './Archived'
import { VesselReportingListTab } from './constants'
import { Current } from './Current'

import type { VesselReportings } from '@features/Reporting/types'

type VesselReportingListProps = Readonly<{
  onTabChange?: (nextTab: VesselReportingListTab) => void
  selectedTab?: VesselReportingListTab
  vesselReportings: VesselReportings | undefined
  withTabs?: boolean
}>
export function VesselReportingList({
  onTabChange,
  selectedTab = VesselReportingListTab.CURRENT_REPORTING,
  vesselReportings,
  withTabs = false
}: VesselReportingListProps) {
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
