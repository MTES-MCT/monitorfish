import { setEditedReporting } from '@features/Reporting/slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ConfirmDeletionModal } from './ConfirmDeletionModal'
import { EditReporting } from './EditReporting'
import { sortByValidationOrCreationDateDesc } from './utils'
import { operationalAlertTypes } from '../../../../../domain/entities/alerts/constants'
import { ReportingType } from '../../../../../domain/types/reporting'
import { deleteReporting } from '../../../useCases/deleteReporting'
import { ReportingCard } from '../ReportingCard'

import type { Reporting } from '../../../../../domain/types/reporting'

export function Current() {
  const dispatch = useMainAppDispatch()
  const currentAndArchivedReportingsOfSelectedVessel = useMainAppSelector(
    state => state.reporting.currentAndArchivedReportingsOfSelectedVessel
  )
  const editedReporting = useMainAppSelector(state => state.reporting.editedReporting)
  const [isNewReportingFormOpen, setIsNewReportingFormOpen] = useState(false)
  const [deletionModalIsOpenForId, setDeletionModalIsOpenForId] = useState<number | undefined>(undefined)

  const closeForm = useCallback(() => {
    setIsNewReportingFormOpen(false)
    dispatch(setEditedReporting(null))
  }, [dispatch])

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
      {!currentAndArchivedReportingsOfSelectedVessel?.current?.length && !isNewReportingFormOpen && (
        <NoReporting>Pas de signalement ouvert sur ce navire.</NoReporting>
      )}
      {!isNewReportingFormOpen && !editedReporting && (
        <NewReportingButton
          accent={Accent.PRIMARY}
          data-cy="vessel-sidebar-open-reporting"
          onClick={() => setIsNewReportingFormOpen(true)}
        >
          Ouvrir un signalement
        </NewReportingButton>
      )}
      {(isNewReportingFormOpen || editedReporting) && <EditReporting closeForm={closeForm} />}
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
      <ConfirmDeletionModal
        closeModal={() => setDeletionModalIsOpenForId(undefined)}
        isOpened={deletionModalIsOpenForId}
        validateCallback={() => deletionModalIsOpenForId && dispatch(deleteReporting(deletionModalIsOpenForId))}
      />
    </Wrapper>
  )
}

const NewReportingButton = styled(Button)`
  margin: 0px 10px 10px 0px;
`

const Wrapper = styled.div`
  background: ${THEME.color.white};
  margin: 10px 5px 5px 5px;
  padding: 16px 16px 1px 16px;
  text-align: left;
  color: ${THEME.color.slateGray};
`

const NoReporting = styled.div`
  margin-bottom: 16px;
`
