import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME, usePrevious } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import { FingerprintSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import { Archived } from './Archived'
import { Current } from './Current'
import { vesselsAreEquals } from '../../../../domain/entities/vessel/vessel'
import { getVesselReportings } from '../../useCases/getVesselReportings'

const ReportingTab = {
  CURRENT_REPORTING: 'CURRENT_REPORTING',
  REPORTING_HISTORY: 'REPORTING_HISTORY'
}

export function VesselReportings() {
  const dispatch = useMainAppDispatch()
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)

  const currentAndArchivedReportingsOfSelectedVessel = useMainAppSelector(
    state => state.reporting.currentAndArchivedReportingsOfSelectedVessel
  )
  const isLoadingReporting = useMainAppSelector(state => state.reporting.isLoadingReporting)

  const [reportingTab, setReportingTab] = useState(ReportingTab.CURRENT_REPORTING)
  const previousSelectedVesselIdentity = usePrevious(selectedVesselIdentity)

  useEffect(() => {
    if (!previousSelectedVesselIdentity || !vesselsAreEquals(previousSelectedVesselIdentity, selectedVesselIdentity)) {
      dispatch(getVesselReportings(true))
    }
  }, [dispatch, previousSelectedVesselIdentity, selectedVesselIdentity])

  useEffect(() => {
    if (!vesselsAreEquals(previousSelectedVesselIdentity, selectedVesselIdentity)) {
      setReportingTab(ReportingTab.CURRENT_REPORTING)
    }
  }, [previousSelectedVesselIdentity, selectedVesselIdentity])

  return (
    <>
      {!isLoadingReporting ? (
        <Body data-cy="vessel-reporting">
          <Menu>
            <CurrentOrHistoryButton
              isActive={reportingTab === ReportingTab.CURRENT_REPORTING}
              onClick={() => setReportingTab(ReportingTab.CURRENT_REPORTING)}
            >
              Signalements en cours ({currentAndArchivedReportingsOfSelectedVessel?.current?.length})
            </CurrentOrHistoryButton>
            <CurrentOrHistoryButton
              data-cy="vessel-sidebar-reporting-tab-history-button"
              isActive={reportingTab === ReportingTab.REPORTING_HISTORY}
              onClick={() => setReportingTab(ReportingTab.REPORTING_HISTORY)}
            >
              Historique des signalements
            </CurrentOrHistoryButton>
          </Menu>
          {reportingTab === ReportingTab.CURRENT_REPORTING && <Current />}
          {reportingTab === ReportingTab.REPORTING_HISTORY && <Archived />}
        </Body>
      ) : (
        <FingerprintSpinner className="radar" color={THEME.color.charcoal} size={100} />
      )}
    </>
  )
}

const CurrentOrHistoryButton = styled.div<{
  isActive: boolean
}>`
  background: ${p => (p.isActive ? p.theme.color.charcoal : 'unset')};
  color: ${p => (p.isActive ? p.theme.color.gainsboro : p.theme.color.gunMetal)};
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
