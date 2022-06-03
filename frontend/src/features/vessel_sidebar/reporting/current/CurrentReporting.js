import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import Reporting from '../Reporting'
import { COLORS } from '../../../../constants/constants'
import { operationalAlertTypes } from '../../../../domain/entities/alerts'
import { ReportingType } from '../../../../domain/entities/reporting'

const CurrentReporting = () => {
  const {
    /** @type {Reporting} */
    currentAndArchivedReporting
  } = useSelector(state => state.reporting)

  return <Wrapper>
    {
      operationalAlertTypes
        .map(alertType => {
          const alertReporting = currentAndArchivedReporting?.current
            ?.filter(reporting => reporting.type === ReportingType.ALERT.code && reporting.value.type === alertType.code)
            ?.sort((a, b) => sortByValidationDate(a, b))

          if (alertReporting?.length) {
            return <Reporting
              key={alertReporting[alertReporting?.length - 1].id}
              reporting={alertReporting[alertReporting?.length - 1]}
              numberOfAlerts={alertReporting?.length}
            />
          }

          return null
        })
    }
    {
      currentAndArchivedReporting?.current
        ?.filter(reporting => reporting.type !== ReportingType.ALERT.code)
        .map(reporting => {
          return <Reporting
            key={reporting.id}
            reporting={reporting}
          />
        })
    }
    {
      !currentAndArchivedReporting?.current?.length
        ? <NoReporting>Aucun signalement</NoReporting>
        : null
    }
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
  padding: 10px 20px;
  text-align: left;
  color: ${COLORS.slateGray};
`

const NoReporting = styled.div`
  margin: 10px;
  text-align: center;
`

export default CurrentReporting
