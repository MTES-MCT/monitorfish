import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { useDispatch, useSelector } from 'react-redux'
import { FingerprintSpinner } from 'react-epic-spinners'
import ArchivedReportings from './archived/ArchivedReportings'
import { CurrentReporting } from './current/CurrentReporting'
import getVesselReportings from '../../../domain/use_cases/vessel/getVesselReportings'
import { usePrevious } from '../../../hooks/usePrevious'
import { vesselsAreEquals } from '../../../domain/entities/vessel/vessel'

const ReportingTab = {
  CURRENT_REPORTING: 'CURRENT_REPORTING',
  REPORTING_HISTORY: 'REPORTING_HISTORY'
}

const VesselReportings = () => {
  const dispatch = useDispatch()
  const {
    selectedVesselIdentity
  } = useSelector(state => state.vessel)

  const {
    /** @type {CurrentAndArchivedReportingsOfSelectedVessel} */
    currentAndArchivedReportingsOfSelectedVessel,
    archivedReportingsFromDate,
    isLoadingReporting
  } = useSelector(state => state.reporting)

  const [reportingTab, setReportingTab] = useState(ReportingTab.CURRENT_REPORTING)
  const previousSelectedVesselIdentity = usePrevious(selectedVesselIdentity)

  useEffect(() => {
    if (archivedReportingsFromDate) {
      dispatch(getVesselReportings(true))
      if (!vesselsAreEquals(previousSelectedVesselIdentity, selectedVesselIdentity)) {
        setReportingTab(ReportingTab.CURRENT_REPORTING)
      }
    }
  }, [selectedVesselIdentity, archivedReportingsFromDate])

  return <>
    {
      !isLoadingReporting
        ? <Body data-cy={'vessel-reporting'}>
          <Menu>
            <CurrentOrHistoryReportingButton
              isActive={reportingTab === ReportingTab.CURRENT_REPORTING}
              onClick={() => setReportingTab(ReportingTab.CURRENT_REPORTING)}
            >
              Signalements en cours ({currentAndArchivedReportingsOfSelectedVessel?.current?.length})
            </CurrentOrHistoryReportingButton>
            <CurrentOrHistoryReportingButton
              data-cy={'vessel-sidebar-reporting-tab-history-button'}
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
              ? <ArchivedReportings/>
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
  margin: 5px;
  border: 1px solid ${COLORS.charcoal};
  display: flex;
  width: 480px;
`

const Body = styled.div`
  padding: 5px;
  overflow-x: hidden;
  max-height: 700px;
`

export default VesselReportings
