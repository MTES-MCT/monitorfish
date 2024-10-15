import { Accent, Button } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { EditReporting } from './EditReporting'
import { ReportingCard } from '../ReportingCard'

import type { Reporting, ReportingAndOccurrences, VesselReportings } from '@features/Reporting/types'
import type { VesselIdentity } from 'domain/entities/vessel/types'

type CurrentProps = Readonly<{
  vesselIdentity: VesselIdentity
  vesselReportings: VesselReportings
  withOpenedNewReportingForm: boolean
}>
export function Current({ vesselIdentity, vesselReportings, withOpenedNewReportingForm }: CurrentProps) {
  const [editedReporting, setEditedReporting] = useState<Reporting.EditableReporting | undefined>()
  const [isNewReportingFormOpen, setIsNewReportingFormOpen] = useState(withOpenedNewReportingForm)

  const closeForm = useCallback(() => {
    setIsNewReportingFormOpen(false)
    setEditedReporting(undefined)
  }, [])

  const reportingsWithoutEdited: ReportingAndOccurrences[] = useMemo(
    () =>
      (vesselReportings.current ?? []).filter(
        reportingAndOccurrences => reportingAndOccurrences.reporting.id !== editedReporting?.id
      ),
    [vesselReportings, editedReporting]
  )

  return (
    <Wrapper>
      {!vesselReportings.current.length && !isNewReportingFormOpen && (
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
      {(isNewReportingFormOpen || editedReporting) && (
        <EditReporting closeForm={closeForm} editedReporting={editedReporting} vesselIdentity={vesselIdentity} />
      )}
      {reportingsWithoutEdited.map(reporting => (
        <ReportingCard
          key={reporting.reporting.id}
          onEdit={setEditedReporting}
          otherOccurrencesOfSameAlert={reporting.otherOccurrencesOfSameAlert}
          reporting={reporting.reporting}
        />
      ))}
    </Wrapper>
  )
}

const NewReportingButton = styled(Button)`
  align-self: flex-start;
  margin: 0px 10px 10px 0px;
`

const Wrapper = styled.div`
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.slateGray};
  display: flex;
  flex-direction: column;
  margin: 10px 5px 5px 5px;
  padding: 16px 16px 1px 16px;
  text-align: left;
`

const NoReporting = styled.div`
  margin-bottom: 16px;
`
