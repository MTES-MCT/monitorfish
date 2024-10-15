import { VesselReportingListTab } from '@features/Vessel/components/VesselSidebar/ReportingList/constants'
import { vesselActions } from '@features/Vessel/slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button, LinkButton } from '@mtes-mct/monitor-ui'
import { VesselSidebarTab } from 'domain/entities/vessel/vessel'
import { showVessel } from 'domain/use_cases/vessel/showVessel'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { EditReporting } from './EditReporting'
import { ReportingCard } from '../ReportingCard'

import type { Reporting, ReportingAndOccurrences, VesselReportings } from '@features/Reporting/types'
import type { VesselIdentity } from 'domain/entities/vessel/types'

type ContentProps = Readonly<{
  onIsDirty: ((isDirty: boolean) => void) | undefined
  vesselIdentity: VesselIdentity
  vesselReportings: VesselReportings
  withOpenedNewReportingForm: boolean
  withVesselSidebarHistoryLink: boolean
}>
export function Content({
  onIsDirty,
  vesselIdentity,
  vesselReportings,
  withOpenedNewReportingForm,
  withVesselSidebarHistoryLink
}: ContentProps) {
  const dispatch = useMainAppDispatch()

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

  const selectMainMapVessel = async () => {
    if (!vesselIdentity) {
      return
    }

    dispatch(showVessel(vesselIdentity, false, true))
    dispatch(vesselActions.setSelectedVesselSidebarTab(VesselSidebarTab.REPORTING))
    dispatch(vesselActions.setSelectedVesselSidebarReportingListTab(VesselReportingListTab.REPORTING_HISTORY))
  }

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
        <EditReporting
          editedReporting={editedReporting}
          onClose={closeForm}
          onIsDirty={onIsDirty}
          vesselIdentity={vesselIdentity}
        />
      )}
      {reportingsWithoutEdited.map(reporting => (
        <ReportingCard
          key={reporting.reporting.id}
          onEdit={setEditedReporting}
          otherOccurrencesOfSameAlert={reporting.otherOccurrencesOfSameAlert}
          reporting={reporting.reporting}
        />
      ))}

      {withVesselSidebarHistoryLink && (
        <LinkButton onClick={selectMainMapVessel}>
          Voir tout l’historique des signalements dans la fiche navire
        </LinkButton>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.slateGray};
  display: flex;
  flex-direction: column;
  margin: 10px 5px 5px 5px;
  padding: 16px 16px 1px 16px;
  text-align: left;
`

const NewReportingButton = styled(Button)`
  align-self: flex-start;
  margin: 0px 10px 10px 0px;
`

const NoReporting = styled.div`
  margin-bottom: 16px;
`
