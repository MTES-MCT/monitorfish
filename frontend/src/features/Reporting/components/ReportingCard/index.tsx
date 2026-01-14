import { ConfirmationModal } from '@components/ConfirmationModal'
import { useGetAllAlertSpecificationsQuery } from '@features/Alert/apis'
import { PendingAlertValueType } from '@features/Alert/constants'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { deleteReporting } from '@features/Reporting/useCases/deleteReporting'
import { reportingIsAnInfractionSuspicion } from '@features/Reporting/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Icon, IconButton, Level, Link, Tag, THEME } from '@mtes-mct/monitor-ui'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { getFrenchOrdinal, getInfractionTitle, getReportingActorLabel } from './utils'
import { getDate, getDateTime } from '../../../../utils'
import { ReportingTypeCharacteristics } from '../../types'
import { archiveReporting } from '../../useCases/archiveReporting'

import type { Reporting } from '../../types'

export type ReportingCardProps = Readonly<{
  isArchived?: boolean
  onEdit?: (nextEditedReporting: Reporting.EditableReporting) => void
  otherOccurrencesOfSameAlert: Reporting.Reporting[]
  reporting: Reporting.Reporting
}>
export function ReportingCard({
  isArchived = false,
  onEdit,
  otherOccurrencesOfSameAlert,
  reporting
}: ReportingCardProps) {
  const dispatch = useMainAppDispatch()
  const { data: alertSpecifications } = useGetAllAlertSpecificationsQuery()

  const alertsNamesWithAutomaticArchiving = (alertSpecifications ?? [])
    .filter(alertSpecification => alertSpecification.hasAutomaticArchiving && alertSpecification.isActivated)
    .map(alertSpecification => alertSpecification.name)

  const [isDeletionConfirmationModalOpen, setIsDeletionConfirmationModalOpen] = useState(false)
  const [isArchivingConfirmationModalOpen, setIsArchivingConfirmationModalOpen] = useState(false)
  const [isOtherOccurrencesDatesOpened, setIsOtherOccurrencesDatesOpened] = useState(false)

  const isAnInfractionSuspicion = reportingIsAnInfractionSuspicion(reporting.type)
  const reportingName = Object.values(ReportingTypeCharacteristics).find(
    reportingType => reportingType.code === reporting.type
  )?.name
  const willExpireAfterNewVoyage =
    reporting.type === ReportingType.ALERT
      ? !!reporting.value.name && alertsNamesWithAutomaticArchiving.includes(reporting.value.name)
      : false
  const willExpire = willExpireAfterNewVoyage || !!reporting.expirationDate
  const canBeArchived = !(
    reporting.type === ReportingType.ALERT && reporting.value.type === PendingAlertValueType.MISSING_FAR_48_HOURS_ALERT
  )
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

  const expirationDateText = useMemo(() => {
    if (!willExpireAfterNewVoyage && !reporting.expirationDate) {
      return 'Pas de fin de validité'
    }

    if (willExpireAfterNewVoyage && !reporting.isArchived) {
      return 'Fin de validité au prochain DEP du navire'
    }

    if (!!reporting.expirationDate && !reporting.isArchived) {
      return `Fin de validité le ${getDate(reporting.expirationDate)}`
    }

    if (willExpireAfterNewVoyage && reporting.isArchived) {
      return 'Archivé automatiquement suite au DEP du navire'
    }

    if (!!reporting.expirationDate && reporting.isArchived) {
      return `La fin de validité était le ${getDate(reporting.expirationDate)}`
    }

    return ''
  }, [reporting, willExpireAfterNewVoyage])

  const askForDeletionConfirmation = () => {
    setIsDeletionConfirmationModalOpen(true)
  }

  const closeDeletionConfirmationModal = () => {
    setIsDeletionConfirmationModalOpen(false)
  }

  const confirmDeletion = () => {
    closeDeletionConfirmationModal()

    dispatch(deleteReporting(reporting.id, reporting.type))

    dispatch(
      addMainWindowBanner({
        children: 'Signalement supprimé.',
        closingDelay: 2000,
        isClosable: true,
        isFixed: true,
        level: Level.SUCCESS,
        withAutomaticClosing: true
      })
    )
  }

  const askForArchivingConfirmation = () => {
    setIsArchivingConfirmationModalOpen(true)
  }

  const closeArchivingConfirmationModal = () => {
    setIsArchivingConfirmationModalOpen(false)
  }

  const confirmArchive = () => {
    closeArchivingConfirmationModal()

    dispatch(archiveReporting(reporting))

    dispatch(
      addMainWindowBanner({
        children: 'Signalement archivé.',
        closingDelay: 2000,
        isClosable: true,
        isFixed: true,
        level: Level.SUCCESS,
        withAutomaticClosing: true
      })
    )
  }

  const handleEdit = () => {
    if (!onEdit || reporting.type === ReportingType.ALERT) {
      return
    }

    onEdit(reporting)
  }

  const hasWillExpire = !reporting.isArchived || (reporting.isArchived && willExpire)

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
            {reportingActor} / {reporting.type === ReportingType.ALERT ? reporting.value.name : reporting.value.title}
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
          {reporting.type === ReportingType.INFRACTION_SUSPICION && <Threat>{reporting.value.threat}</Threat>}
          {reporting.type !== ReportingType.ALERT && (
            <Description $marginTop={reporting.type === ReportingType.OBSERVATION ? 10 : 0}>
              {reporting.value.description}
            </Description>
          )}
          {reporting.type !== ReportingType.ALERT && !!reporting.value.authorContact && (
            <Contact>Émetteur: {reporting.value.authorContact}</Contact>
          )}
          {reporting.type !== ReportingType.OBSERVATION && (
            <StyledTag accent={Accent.PRIMARY} isLight title={getInfractionTitle(reporting)}>
              {reporting.value.threatCharacterization} / NATINF {reporting.value.natinfCode}
            </StyledTag>
          )}
          {reporting.type === ReportingType.ALERT && !!reporting.value.depth && (
            <Natinf>Profondeur: {reporting.value.depth}m</Natinf>
          )}
          {hasWillExpire && (
            <ExpirationDate>
              <Icon.Clock color={THEME.color.slateGray} />
              <ExpirationDateText $isEmpty={!willExpire}>{expirationDateText}</ExpirationDateText>
            </ExpirationDate>
          )}
          {reporting.type !== ReportingType.ALERT && !!reporting.value.authorTrigram && (
            <Author $marginTop={!hasWillExpire ? 16 : 0}>Créé par {reporting.value.authorTrigram}</Author>
          )}
        </Body>

        {isArchived && otherOccurrencesOfSameAlert.length > 0 && (
          <NumberOfAlerts $isArchived>{otherOccurrencesOfSameAlert.length + 1}</NumberOfAlerts>
        )}
        {!isArchived && (
          <Actions>
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
              onClick={askForArchivingConfirmation}
              title={
                canBeArchived
                  ? 'Archiver ce signalement'
                  : `Ce signalement sera archivé sous la forme de 2 alertes "Absence de message FAR en 24h"`
              }
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
        {isArchived && (
          <Actions>
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
      {isArchivingConfirmationModalOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Archiver"
          iconName="Archive"
          message="Êtes-vous sûr de vouloir archiver ce signalement ?"
          onCancel={closeArchivingConfirmationModal}
          onConfirm={confirmArchive}
          title="Archivage du signalement"
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

const StyledTag = styled(Tag)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 330px;
  display: inline-block;
  margin-top: 8px;
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

const Actions = styled.div`
  border-left: 2px solid ${p => p.theme.color.white};
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
  font-weight: 700;
`

const DateText = styled.span`
  font-size: 11px;
`

const Natinf = styled.div`
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
  margin-top: 12px;
  padding: 2px 8px;
  width: fit-content;
`

const Threat = styled.div`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 700;
  margin-top: 10px;
  white-space: pre-wrap;
`

const Description = styled.div<{
  $marginTop?: number
}>`
  color: ${p => p.theme.color.gunMetal};
  margin-top: ${p => p.$marginTop ?? 0}px;
  white-space: pre-wrap;
`

const Contact = styled.div`
  color: ${p => p.theme.color.gunMetal};
`

const Author = styled.div<{
  $marginTop?: number
}>`
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
  margin-top: ${p => p.$marginTop ?? 0}px;
`

const ExpirationDate = styled.div`
  margin-top: 14px;
`

const ExpirationDateText = styled.span<{ $isEmpty: boolean }>`
  color: ${p => (p.$isEmpty ? p.theme.color.slateGray : p.theme.color.gunMetal)};
  font-style: ${p => (p.$isEmpty ? 'italic' : 'none')};
  vertical-align: super;
  margin-left: 6px;
`
