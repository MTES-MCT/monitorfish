import { FingerprintSpinner } from '@components/FingerprintSpinner'
import { Summary } from '@features/Reporting/components/CardReportingList/Summary'
import { useGetVesselReportingsByVesselIdentityQuery } from '@features/Vessel/vesselApi'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME, usePrevious } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { Archived } from './Archived'
import { Current } from './Current'
import { vesselsAreEquals } from '../../../../domain/entities/vessel/vessel'

const ReportingTab = {
  CURRENT_REPORTING: 'CURRENT_REPORTING',
  REPORTING_HISTORY: 'REPORTING_HISTORY'
}

export function CardReportingList() {
  const archivedReportingsFromDate = useMainAppSelector(state => state.mainWindowReporting.archivedReportingsFromDate)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const vesselIdentity = useMainAppSelector(state => state.mainWindowReporting.vesselIdentity)

  const { data: selectedVesselReportings } = useGetVesselReportingsByVesselIdentityQuery(
    vesselIdentity
      ? {
          fromDate: archivedReportingsFromDate,
          vesselIdentity
        }
      : skipToken
  )

  const [reportingTab, setReportingTab] = useState(ReportingTab.CURRENT_REPORTING)
  const previousSelectedVesselIdentity = usePrevious(selectedVesselIdentity)

  useEffect(() => {
    if (!vesselsAreEquals(previousSelectedVesselIdentity, selectedVesselIdentity)) {
      setReportingTab(ReportingTab.CURRENT_REPORTING)
    }
  }, [previousSelectedVesselIdentity, selectedVesselIdentity])

  return (
    <>
      {!selectedVesselReportings && <FingerprintSpinner className="radar" color={THEME.color.charcoal} size={100} />}
      {selectedVesselReportings && (
        <Body data-cy="vessel-reporting">
          <Menu>
            <CurrentOrHistoryButton
              $isActive={reportingTab === ReportingTab.CURRENT_REPORTING}
              onClick={() => setReportingTab(ReportingTab.CURRENT_REPORTING)}
            >
              Signalements en cours ({selectedVesselReportings.current.length})
            </CurrentOrHistoryButton>
            <CurrentOrHistoryButton
              $isActive={reportingTab === ReportingTab.REPORTING_HISTORY}
              data-cy="vessel-sidebar-reporting-tab-history-button"
              onClick={() => setReportingTab(ReportingTab.REPORTING_HISTORY)}
            >
              Historique des signalements
            </CurrentOrHistoryButton>
          </Menu>
          {reportingTab === ReportingTab.CURRENT_REPORTING && <Current />}
          {reportingTab === ReportingTab.REPORTING_HISTORY && (
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
