import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ConfirmDeletionModal } from './ConfirmDeletionModal'
import { CreateOrEditReporting } from './CreateOrEditReporting'
import { COLORS } from '../../../../constants/constants'
import { COMMON_ALERT_TYPE_OPTION } from '../../../../domain/entities/alerts/constants'
import { ReportingType } from '../../../../domain/types/reporting'
import { deleteReporting } from '../../../../domain/use_cases/reporting/deleteReporting'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { ReportingCard } from '../ReportingCard'

// TODO Move that into a constants file.
export const operationalAlertTypes = Object.keys(COMMON_ALERT_TYPE_OPTION)
  .map(alertTypeName => COMMON_ALERT_TYPE_OPTION[alertTypeName])
  .filter(alertType => alertType.isOperationalAlert)

export function Current() {
  const dispatch = useMainAppDispatch()
  const { currentAndArchivedReportingsOfSelectedVessel, editedReporting } = useMainAppSelector(state => state.reporting)
  const [deletionModalIsOpenForId, setDeletionModalIsOpenForId] = useState<number | undefined>(undefined)

  const getAlertsOfType = useCallback(
    alertType =>
      currentAndArchivedReportingsOfSelectedVessel?.current
        ?.filter(reporting => reporting.type === ReportingType.ALERT && reporting.value.type === alertType.code)
        ?.sort((a, b) => sortByValidationDate(b, a)) || [],
    [currentAndArchivedReportingsOfSelectedVessel]
  )

  const reportingsWithoutAlerts = useMemo(
    () =>
      (currentAndArchivedReportingsOfSelectedVessel?.current || [])
        .filter(reporting => reporting.type !== ReportingType.ALERT)
        .filter(reporting => reporting.id !== editedReporting?.id)
        .sort((a, b) => sortByValidationDate(b, a)),
    [currentAndArchivedReportingsOfSelectedVessel, editedReporting]
  )

  return (
    <Wrapper>
      <CreateOrEditReporting />
      {operationalAlertTypes.map(alertType => {
        const alertReportings = getAlertsOfType(alertType)
        if (!alertReportings?.length) {
          return null
        }

        return (
          <ReportingCard
            // TODO We need to change that with a proper cursor.
            // eslint-disable-next-line no-unsafe-optional-chaining
            key={(alertReportings as any)[alertReportings?.length - 1].id}
            numberOfAlerts={alertReportings?.length}
            openConfirmDeletionModalForId={setDeletionModalIsOpenForId}
            // eslint-disable-next-line no-unsafe-optional-chaining
            reporting={alertReportings[alertReportings?.length - 1]!!}
          />
        )
      })}
      {reportingsWithoutAlerts.map(reporting => (
        <ReportingCard
          key={reporting.id}
          openConfirmDeletionModalForId={setDeletionModalIsOpenForId}
          reporting={reporting}
        />
      ))}
      {!currentAndArchivedReportingsOfSelectedVessel?.current?.length && <NoReporting>Aucun signalement</NoReporting>}
      <ConfirmDeletionModal
        closeModal={() => setDeletionModalIsOpenForId(undefined)}
        isOpened={deletionModalIsOpenForId}
        validateCallback={() => deletionModalIsOpenForId && dispatch(deleteReporting(deletionModalIsOpenForId))}
      />
    </Wrapper>
  )
}

function sortByValidationDate(a, b) {
  if (a.validationDate && b.validationDate) {
    return a.validationDate.localeCompare(b.validationDate)
  }

  if (a.creationDate && b.creationDate) {
    return a.creationDate.localeCompare(b.creationDate)
  }

  return null
}

const Wrapper = styled.div`
  background: ${COLORS.white};
  margin: 10px 5px 5px 5px;
  padding: 16px 16px 1px 16px;
  text-align: left;
  color: ${COLORS.slateGray};
`

const NoReporting = styled.div`
  margin: 10px;
  text-align: center;
`
