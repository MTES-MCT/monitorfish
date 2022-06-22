import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import Reporting from '../Reporting'
import { COLORS } from '../../../../constants/constants'
import { operationalAlertTypes } from '../../../../domain/entities/alerts'
import { ReportingType } from '../../../../domain/entities/reporting'
import ConfirmDeletionModal from './ConfirmDeletionModal'
import NewReporting from './NewReporting'

const CurrentReporting = () => {
  const {
    /** @type {CurrentAndArchivedReportings} */
    currentAndArchivedReportings
  } = useSelector(state => state.reporting)
  const [deletionModalIsOpenForId, setDeletionModalIsOpenForId] = useState(undefined)

  return <Wrapper>
    <NewReporting/>
    {
      operationalAlertTypes
        .map(alertType => {
          const alertReportings = currentAndArchivedReportings?.current
            ?.filter(reporting => reporting.type === ReportingType.ALERT.code && reporting.value.type === alertType.code)
            ?.sort((a, b) => sortByValidationDate(a, b))

          if (alertReportings?.length) {
            return <Reporting
              key={alertReportings[alertReportings?.length - 1].id}
              reporting={alertReportings[alertReportings?.length - 1]}
              numberOfAlerts={alertReportings?.length}
              openConfirmDeletionModalForId={setDeletionModalIsOpenForId}
            />
          }

          return null
        })
    }
    {
      currentAndArchivedReportings?.current
        ?.filter(reporting => reporting.type !== ReportingType.ALERT.code)
        .map(reporting => {
          return <Reporting
            key={reporting.id}
            reporting={reporting}
            openConfirmDeletionModalForId={setDeletionModalIsOpenForId}
          />
        })
    }
    {
      !currentAndArchivedReportings?.current?.length
        ? <NoReporting>Aucun signalement</NoReporting>
        : null
    }
    <ConfirmDeletionModal
      closeModal={() => setDeletionModalIsOpenForId(null)}
      modalIsOpenForId={deletionModalIsOpenForId}
    />
  </Wrapper>
}

function sortByValidationDate (a, b) {
  if (a.validationDate && b.validationDate) {
    return a.validationDate.localeCompare(b.validationDate)
  }

  return null
}

const Wrapper = styled.div`
  background: ${COLORS.white};
  margin: 10px 5px 5px 5px;
  padding: 15px 20px 10px 20px;
  text-align: left;
  color: ${COLORS.slateGray};
`

const NoReporting = styled.div`
  margin: 10px;
  text-align: center;
`

export default CurrentReporting
