import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ConfirmDeletionModal } from './ConfirmDeletionModal'
import { CreateOrEditReporting } from './CreateOrEditReporting'
import { sortByValidationOrCreationDateDesc } from './utils'
import { COLORS } from '../../../../../constants/constants'
import { operationalAlertTypes } from '../../../../../domain/entities/alerts/constants'
import { ReportingType } from '../../../../../domain/types/reporting'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { deleteReporting } from '../../../useCases/deleteReporting'
import { ReportingCard } from '../ReportingCard'

import type { Reporting } from '../../../../../domain/types/reporting'

export function Current() {
  const dispatch = useMainAppDispatch()
  const currentAndArchivedReportingsOfSelectedVessel = useMainAppSelector(
    state => state.reporting.currentAndArchivedReportingsOfSelectedVessel
  )
  const editedReporting = useMainAppSelector(state => state.reporting.editedReporting)
  const [deletionModalIsOpenForId, setDeletionModalIsOpenForId] = useState<number | undefined>(undefined)

  const getAlertsDesc = useCallback(
    alertType =>
      currentAndArchivedReportingsOfSelectedVessel?.current
        ?.filter(reporting => reporting.type === ReportingType.ALERT && reporting.value.type === alertType.code)
        ?.sort((a, b) => sortByValidationOrCreationDateDesc(a, b)) || [],
    [currentAndArchivedReportingsOfSelectedVessel]
  )

  const reportingsWithoutAlerts: Reporting[] = useMemo(
    () =>
      (currentAndArchivedReportingsOfSelectedVessel?.current || [])
        .filter(reporting => reporting.type !== ReportingType.ALERT)
        .filter(reporting => reporting.id !== editedReporting?.id)
        .sort((a, b) => sortByValidationOrCreationDateDesc(a, b)),
    [currentAndArchivedReportingsOfSelectedVessel, editedReporting]
  )

  return (
    <Wrapper>
      <CreateOrEditReporting />
      {operationalAlertTypes.map(alertType => {
        const alertReportings = getAlertsDesc(alertType)
        if (!alertReportings.length) {
          return null
        }

        const lastValidatedAlert = alertReportings[0]
        if (!lastValidatedAlert) {
          return null
        }

        return (
          <ReportingCard
            key={lastValidatedAlert.id}
            numberOfAlerts={alertReportings.length}
            openConfirmDeletionModalForId={setDeletionModalIsOpenForId}
            reporting={lastValidatedAlert}
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
