import { buildVesselContext } from '@features/Reporting/components/VesselReportings/CurrentReportingList/utils'
import { vesselActions } from '@features/Vessel/slice'
import { VesselSidebarTab } from '@features/Vessel/types/vessel'
import { showVessel } from '@features/Vessel/useCases/showVessel'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button, LinkButton } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { EditReporting } from './EditReporting'
import { ReportingCard } from '../../ReportingCard'

import type { Reporting, ReportingAndOccurrences, VesselReportings } from '@features/Reporting/types'
import type { Vessel } from '@features/Vessel/Vessel.types'

type ContentProps = Readonly<{
  className: string | undefined
  onIsDirty: ((isDirty: boolean) => void) | undefined
  vesselIdentity: Vessel.VesselIdentity
  vesselReportings: VesselReportings
  withOpenedNewReportingForm: boolean
  withVesselSidebarHistoryLink: boolean
}>
export function Content({
  className,
  onIsDirty,
  vesselIdentity,
  vesselReportings,
  withOpenedNewReportingForm,
  withVesselSidebarHistoryLink
}: ContentProps) {
  const dispatch = useMainAppDispatch()

  const [editedReporting, setEditedReporting] = useState<Reporting.EditableReporting | undefined>(
    withOpenedNewReportingForm ? buildVesselContext(vesselIdentity) : undefined
  )

  const closeForm = useCallback(() => {
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

    dispatch(showVessel(vesselIdentity, false))
    dispatch(vesselActions.setSelectedVesselSidebarTab(VesselSidebarTab.REPORTING))
  }

  return (
    <Wrapper className={className}>
      {!vesselReportings.current.length && !editedReporting && (
        <NoReporting>Pas de signalement ouvert sur ce navire.</NoReporting>
      )}
      {!editedReporting && (
        <NewReportingButton
          accent={Accent.PRIMARY}
          data-cy="vessel-sidebar-open-reporting"
          onClick={() => setEditedReporting(buildVesselContext(vesselIdentity))}
        >
          Ouvrir un signalement
        </NewReportingButton>
      )}
      {editedReporting && <EditReporting editedReporting={editedReporting} onClose={closeForm} onIsDirty={onIsDirty} />}
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
  padding: 16px 16px 0 16px;
  text-align: left;
`

const NewReportingButton = styled(Button)`
  align-self: flex-start;
  margin: 0 10px 10px 0;
`

const NoReporting = styled.div`
  margin-bottom: 16px;
`
