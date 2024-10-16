import { ConfirmationModal } from '@components/ConfirmationModal'
import { deleteReporting } from '@features/Reporting/useCases/deleteReporting'
import { reportingIsAnInfractionSuspicion } from '@features/Reporting/utils'
import { getAlertNameFromType } from '@features/SideWindow/Alert/AlertListAndReportingList/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Icon, IconButton, THEME, Link } from '@mtes-mct/monitor-ui'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { getFrenchOrdinal, getReportingActorLabel } from './utils'
import { getDateTime } from '../../../../utils'
import { ReportingType, ReportingTypeCharacteristics } from '../../types'
import { archiveReporting } from '../../useCases/archiveReporting'

import type { Reporting } from '../../types'

export type ReportingCardProps = Readonly<{
  isArchived?: boolean
  onEdit?: (nextEditedReporting: Reporting.EditableReporting) => void
  otherOccurrencesOfSameAlert: Array<Reporting.Reporting>
  reporting: Reporting.Reporting
}>
export function ReportingCard({
  isArchived = false,
  onEdit,
  otherOccurrencesOfSameAlert,
  reporting
}: ReportingCardProps) {
  const dispatch = useMainAppDispatch()

  const [isDeletionConfirmationModalOpen, setIsDeletionConfirmationModalOpen] = useState(false)
  const [isOtherOccurrencesDatesOpened, setIsOtherOccurrencesDatesOpened] = useState(false)

  const isAnInfractionSuspicion = reportingIsAnInfractionSuspicion(reporting.type)
  const reportingName = Object.values(ReportingTypeCharacteristics).find(
    reportingType => reportingType.code === reporting.type
  )?.name
  const alertDateTime = getDateTime(
    reporting.type === ReportingType.ALERT ? reporting.validationDate : reporting.creationDate,
    true
  )
  const otherOccurrencesDates = otherOccurrencesOfSameAlert.map((alert, index, array) => {
    const dateTime = getDateTime(alert.validationDate, true)

    return `${getFrenchOrdinal(array.length - (index + 1))} alerte le ${dateTime}`
  })

  const reportingActor = useMemo(() => {
    if (reporting.type === ReportingType.ALERT) {
      return reportingName
    }

    return getReportingActorLabel(reporting.value.reportingActor, reporting.value.controlUnit)
  }, [reporting, reportingName])

  const archive = () => {
    dispatch(archiveReporting(reporting.id, reporting.type))
  }

  const askForDeletionConfirmation = () => {
    setIsDeletionConfirmationModalOpen(true)
  }

  const closeDeletionConfirmationModal = () => {
    setIsDeletionConfirmationModalOpen(false)
  }

  const confirmDeletion = () => {
    closeDeletionConfirmationModal()

    dispatch(deleteReporting(reporting.id, reporting.type))
  }

  const handleEdit = () => {
    if (!onEdit || reporting.type === ReportingType.ALERT) {
      return
    }

    onEdit(reporting)
  }

  return (
    <>
      <Wrapper $isInfractionSuspicion={isAnInfractionSuspicion} data-cy="reporting-card">
        {isAnInfractionSuspicion ? (
          <StyledAlertIcon color={THEME.color.maximumRed} />
        ) : (
          <StyledObservationIcon color={THEME.color.charcoal} />
        )}

        <Body $isInfractionSuspicion={isAnInfractionSuspicion}>
          <Title>
            {reportingActor} /{' '}
            {reporting.type === ReportingType.ALERT
              ? getAlertNameFromType(reporting.value.type)
              : reporting.value.title}
          </Title>
          <DateText>
            {otherOccurrencesOfSameAlert.length > 0 ? 'Dernière alerte le' : 'Le'} {alertDateTime}
            {otherOccurrencesOfSameAlert.length > 0 && (
              <>
                {isOtherOccurrencesDatesOpened ? (
                  <>
                    <OtherOccurrenceDates>
                      {otherOccurrencesDates.map(dateTime => (
                        <OtherOccurrenceAlertDate key={dateTime}>{dateTime}</OtherOccurrenceAlertDate>
                      ))}
                    </OtherOccurrenceDates>
                    <OpenOrCloseOtherOccurrenceDates onClick={() => setIsOtherOccurrencesDatesOpened(false)}>
                      Masquer les dates des autres alertes
                    </OpenOrCloseOtherOccurrenceDates>
                  </>
                ) : (
                  <OpenOrCloseOtherOccurrenceDates onClick={() => setIsOtherOccurrencesDatesOpened(true)}>
                    Voir les dates des autres alertes
                  </OpenOrCloseOtherOccurrenceDates>
                )}
              </>
            )}
          </DateText>
          {reporting.type !== ReportingType.ALERT && <Description>{reporting.value.description}</Description>}
          {reporting.type !== ReportingType.ALERT && !!reporting.value.authorContact && (
            <Author>Émetteur: {reporting.value.authorContact}</Author>
          )}
          {reporting.type !== ReportingType.ALERT && !!reporting.value.authorTrigram && (
            <Author>Saisi par: {reporting.value.authorTrigram}</Author>
          )}
          {reporting.type !== ReportingType.OBSERVATION && !Number.isNaN(reporting.value.natinfCode) && (
            <Natinf
              title={
                reporting.infraction
                  ? `${reporting.infraction?.natinfCode || null}: ${
                      reporting.infraction?.infraction || ''
                    } (réglementation "${reporting.infraction?.regulation || ''}")`
                  : ''
              }
            >
              NATINF {reporting.value.natinfCode}
            </Natinf>
          )}
        </Body>

        {isArchived && otherOccurrencesOfSameAlert.length > 0 && (
          <NumberOfAlerts $isArchived>{otherOccurrencesOfSameAlert.length + 1}</NumberOfAlerts>
        )}
        {!isArchived && (
          <Actions $hasOccurrences={otherOccurrencesOfSameAlert.length > 0}>
            {otherOccurrencesOfSameAlert.length > 0 && (
              <NumberOfAlerts>{otherOccurrencesOfSameAlert.length + 1}</NumberOfAlerts>
            )}
            {reporting.type !== ReportingType.ALERT && onEdit && (
              <StyledIconButton
                accent={Accent.TERTIARY}
                color={THEME.color.charcoal}
                data-cy={`edit-reporting-card-${reporting.id}`}
                Icon={Icon.EditUnbordered}
                iconSize={20}
                onClick={handleEdit}
                title="Éditer ce signalement"
              />
            )}
            <StyledIconButton
              accent={Accent.TERTIARY}
              color={THEME.color.charcoal}
              data-cy="archive-reporting-card"
              Icon={Icon.Archive}
              iconSize={20}
              onClick={archive}
              title="Archiver ce signalement"
            />
            <StyledIconButton
              accent={Accent.TERTIARY}
              color={THEME.color.charcoal}
              data-cy="delete-reporting-card"
              Icon={Icon.Delete}
              iconSize={20}
              onClick={askForDeletionConfirmation}
              title="Supprimer ce signalement"
            />
          </Actions>
        )}
      </Wrapper>

      {isDeletionConfirmationModalOpen && (
        <ConfirmationModal
          color={THEME.color.maximumRed}
          confirmationButtonLabel="Supprimer"
          iconName="Delete"
          message="Êtes-vous sûr de vouloir supprimer ce signalement ?"
          onCancel={closeDeletionConfirmationModal}
          onConfirm={confirmDeletion}
          title="Suppression du signalement"
        />
      )}
    </>
  )
}

const Wrapper = styled.div<{
  $isInfractionSuspicion?: boolean
}>`
  background: ${p => (p.$isInfractionSuspicion ? p.theme.color.maximumRed15 : p.theme.color.gainsboro)} 0% 0% no-repeat
    padding-box;
  display: flex;
  margin-bottom: 16px;
`

const StyledIconButton = styled(IconButton)`
  padding-top: 8px;
`

const OtherOccurrenceAlertDate = styled.span`
  font-size: 11px;
  margin-top: 4px;
  display: block;
  color: ${p => p.theme.color.gunMetal};
`

const OtherOccurrenceDates = styled.div`
  margin-top: 4px;
  display: block;
`

const OpenOrCloseOtherOccurrenceDates = styled(Link)`
  font-size: 11px;
  display: block;
  margin-top: 4px;
  cursor: pointer;
`

const StyledAlertIcon = styled(Icon.Alert)`
  margin: 12px;
`

const StyledObservationIcon = styled(Icon.Observation)`
  margin: 12px;
`

const Body = styled.div<{
  $isInfractionSuspicion?: boolean
}>`
  color: ${p => (p.$isInfractionSuspicion ? p.theme.color.maximumRed : p.theme.color.gunMetal)};
  margin-bottom: 12px;
  margin-top: 12px;
  width: 365px;
`

const Actions = styled.div<{
  $hasOccurrences: boolean
}>`
  border-left: 2px solid ${p => p.theme.color.white};
  padding-top: ${p => (p.$hasOccurrences ? 8 : 3)}px;
  text-align: center;
  width: 32px;
  margin-left: auto;
`

const NumberOfAlerts = styled.span<{
  $isArchived?: boolean | undefined
}>`
  margin-top: 8px;
  margin-right: ${p => (p.$isArchived ? '8px' : 'unset')};
  margin-left: ${p => (p.$isArchived ? 'auto' : 'unset')};
  background: ${p => p.theme.color.maximumRed} 0% 0% no-repeat padding-box;
  border-radius: 2px;
  color: ${p => p.theme.color.white};
  display: inline-block;
  font-weight: 700;
  height: 18px;
  line-height: 16px;
  padding: 0 5.1px;
`

const Title = styled.div`
  font: normal normal bold 13px/18px Marianne;
`

const DateText = styled.span`
  font: normal normal normal 11px/15px Marianne;
`

const Natinf = styled.div`
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.gunMetal};
  font: normal normal medium 13px/18px Marianne;
  margin-top: 12px;
  padding: 2px 8px;
  width: fit-content;
`

const Description = styled.div`
  color: ${p => p.theme.color.gunMetal};
  font: normal normal bold 13px/18px Marianne;
  margin-top: 10px;
  white-space: normal;
`

const Author = styled.div`
  color: ${p => p.theme.color.gunMetal};
  font: normal normal normal 13px/18px Marianne;
`
