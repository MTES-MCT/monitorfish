import React, { useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { useSelector } from 'react-redux'
import { FingerprintSpinner } from 'react-epic-spinners'
import ReportingHistory from './ReportingHistory'
import CurrentReporting from './CurrentReporting'

const ReportingTab = {
  CURRENT_REPORTING: 'CURRENT_REPORTING',
  REPORTING_HISTORY: 'REPORTING_HISTORY'
}

const VesselReporting = () => {
  const {
    /** @type {Reporting} */
    currentAndArchivedReporting,
    loadingReporting
  } = useSelector(state => state.reporting)

  const [reportingTab, setReportingTab] = useState(ReportingTab.CURRENT_REPORTING)

  return <>
    {
      !loadingReporting
        ? <Body data-cy={'vessel-reporting'}>
          <Menu>
            <CurrentOrHistoryReportingButton
              isActive={reportingTab === ReportingTab.CURRENT_REPORTING}
              onClick={() => setReportingTab(ReportingTab.CURRENT_REPORTING)}
            >
              Signalements en cours ({currentAndArchivedReporting?.current?.length})
            </CurrentOrHistoryReportingButton>
            <CurrentOrHistoryReportingButton
              isActive={reportingTab === ReportingTab.REPORTING_HISTORY}
              onClick={() => setReportingTab(ReportingTab.REPORTING_HISTORY)}
            >
              Historique des signalements
            </CurrentOrHistoryReportingButton>
          </Menu>
          {
            reportingTab === ReportingTab.CURRENT_REPORTING
              ? <CurrentReporting/>
              : null
          }
          {
            reportingTab === ReportingTab.REPORTING_HISTORY
              ? <ReportingHistory/>
              : null
          }
        </Body>
        : <FingerprintSpinner color={COLORS.charcoal} className={'radar'} size={100}/>
    }
  </>
}

const CurrentOrHistoryReportingButton = styled.div`
  padding: 7px 0 7px 0;
  flex-grow: 1;
  color: ${props => props.isActive ? COLORS.gainsboro : COLORS.gunMetal};
  background: ${props => props.isActive ? COLORS.charcoal : 'unset'};
  cursor: pointer;
`

const Menu = styled.div`
  border: 1px solid ${COLORS.charcoal};
  display: flex;
  width: 480px;
`

const Body = styled.div`
  padding: 10px;
  overflow-x: hidden;
  max-height: 700px;
`

export default VesselReporting
