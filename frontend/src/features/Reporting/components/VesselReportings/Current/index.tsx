import { setEditedReporting } from '@features/Reporting/slice'
import { ReportingType } from '@features/Reporting/types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ConfirmDeletionModal } from './ConfirmDeletionModal'
import { EditReporting } from './EditReporting'
import { deleteReporting } from '../../../useCases/deleteReporting'
import { ReportingCard } from '../ReportingCard'

import type { ReportingAndOccurrences } from '@features/Reporting/types'

export function Current() {
  const dispatch = useMainAppDispatch()
  const currentAndArchivedReportingsOfSelectedVessel = useMainAppSelector(
    state => state.reporting.currentAndArchivedReportingsOfSelectedVessel
  )
  const editedReporting = useMainAppSelector(state => state.reporting.editedReporting)
  const [isNewReportingFormOpen, setIsNewReportingFormOpen] = useState(false)
  const [isDeletionModalOpened, setIsDeletionModalOpened] = useState<
    { id: number; reportingType: ReportingType } | undefined
  >(undefined)

  const closeForm = useCallback(() => {
    setIsNewReportingFormOpen(false)
    dispatch(setEditedReporting(null))
  }, [dispatch])

  const reportingsWithoutEdited: ReportingAndOccurrences[] = useMemo(
    () =>
      (currentAndArchivedReportingsOfSelectedVessel?.current || []).filter(
        reportingAndOccurrences => reportingAndOccurrences.reporting.id !== editedReporting?.id
      ),
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
      {reportingsWithoutEdited.map(reporting => (
        <ReportingCard
          key={reporting.reporting.id}
          numberOfOccurrences={reporting.otherOccurrences.length + 1}
          openConfirmDeletionModal={setIsDeletionModalOpened}
          reporting={reporting.reporting}
        />
      ))}
      <ConfirmDeletionModal
        closeModal={() => setIsDeletionModalOpened(undefined)}
        isOpened={!!isDeletionModalOpened}
        validateCallback={() =>
          isDeletionModalOpened &&
          dispatch(deleteReporting(isDeletionModalOpened.id, isDeletionModalOpened.reportingType))
        }
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
