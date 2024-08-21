import { getReportingActorLabel } from '@features/Reporting/components/VesselReportings/utils'
import { reportingIsAnInfractionSuspicion } from '@features/Reporting/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Icon, IconButton, THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { ReportingType } from '../../../../domain/types/reporting'
import { getDateTime } from '../../../../utils'
import { getAlertNameFromType } from '../../../SideWindow/Alert/AlertListAndReportingList/utils'
import { setEditedReporting } from '../../slice'
import { ReportingTypeCharacteristics } from '../../types'
import archiveReporting from '../../useCases/archiveReporting'

import type { Reporting } from '../../../../domain/types/reporting'
import type { Promisable } from 'type-fest'

export type ReportingCardProps = {
  isArchive?: boolean
  numberOfAlerts?: number
  openConfirmDeletionModalForId: (reportingId: number) => Promisable<void>
  // TODO Doesn't respect Reporting type from domain. Can it be undefined (wouldn't make sense)?
  reporting: Reporting
}
export function ReportingCard({
  isArchive = false,
  numberOfAlerts,
  openConfirmDeletionModalForId,
  reporting
}: ReportingCardProps) {
  const dispatch = useMainAppDispatch()
  const isAnInfractionSuspicion = reportingIsAnInfractionSuspicion(reporting.type)
  const reportingName = Object.values(ReportingTypeCharacteristics).find(
    reportingType => reportingType.code === reporting.type
  )?.name

  const reportingActor = useMemo(() => {
    if (reporting.type === ReportingType.ALERT) {
      return reportingName
    }

    return getReportingActorLabel(reporting.value.reportingActor, reporting.value.controlUnit)
  }, [reporting, reportingName])

  return (
    <Wrapper data-cy="reporting-card" isInfractionSuspicion={isAnInfractionSuspicion}>
      {isAnInfractionSuspicion ? (
        <StyledAlertIcon color={THEME.color.maximumRed} />
      ) : (
        <StyledObservationIcon color={THEME.color.charcoal} />
      )}
      <Body isInfractionSuspicion={isAnInfractionSuspicion}>
        <Title>
          {reportingActor} /{' '}
          {reporting.type === ReportingType.ALERT ? getAlertNameFromType(reporting.value.type) : reporting.value.title}
        </Title>
        <Date>
          {numberOfAlerts ? 'Dernière alerte le' : 'Le'}{' '}
          {getDateTime(
            reporting.type === ReportingType.ALERT ? reporting.validationDate : reporting.creationDate,
            true
          )}
        </Date>
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
      {!isArchive && (
        <Actions isAlert={!!numberOfAlerts} isInfractionSuspicion={isAnInfractionSuspicion}>
          {numberOfAlerts && <NumberOfAlerts>{numberOfAlerts}</NumberOfAlerts>}
          <IconButton
            accent={Accent.TERTIARY}
            color={THEME.color.charcoal}
            data-cy={`edit-reporting-card-${reporting.id}`}
            Icon={Icon.EditUnbordered}
            iconSize={20}
            onClick={() => dispatch(setEditedReporting(reporting))}
            title="Editer"
          />
          <IconButton
            accent={Accent.TERTIARY}
            color={THEME.color.charcoal}
            data-cy="archive-reporting-card"
            Icon={Icon.Archive}
            iconSize={20}
            onClick={() => dispatch(archiveReporting(reporting.id))}
            title="Archiver"
          />
          <IconButton
            accent={Accent.TERTIARY}
            color={THEME.color.charcoal}
            data-cy="delete-reporting-card"
            Icon={Icon.Delete}
            iconSize={20}
            onClick={() => openConfirmDeletionModalForId(reporting.id)}
            title="Supprimer"
          />
        </Actions>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  isInfractionSuspicion?: boolean
}>`
  background: ${p => (p.isInfractionSuspicion ? p.theme.color.maximumRed15 : p.theme.color.gainsboro)} 0% 0% no-repeat
    padding-box;
  display: flex;
  margin-bottom: 16px;
`

const StyledAlertIcon = styled(Icon.Alert)`
  margin: 12px;
`

const StyledObservationIcon = styled(Icon.Observation)`
  margin: 12px;
`

const Body = styled.div<{
  isInfractionSuspicion?: boolean
}>`
  color: ${p => (p.isInfractionSuspicion ? p.theme.color.maximumRed : p.theme.color.gunMetal)};
  margin-bottom: 12px;
  margin-top: 12px;
  width: 365px;
`

const Actions = styled.div<{
  isAlert: boolean
  isInfractionSuspicion?: boolean
}>`
  border-left: 2px solid ${p => p.theme.color.white};
  padding-top: ${p => (p.isAlert ? 8 : 3)}px;
  text-align: center;
  width: 32px;
  margin-left: auto;
`

const NumberOfAlerts = styled.span`
  background: ${p => p.theme.color.maximumRed} 0% 0% no-repeat padding-box;
  border-radius: 2px;
  color: ${p => p.theme.color.white};
  display: inline-block;
  font-weight: 500;
  height: 17px;
  line-height: 16px;
  padding: 0 5.5px;
`

const Title = styled.div`
  font: normal normal bold 13px/18px Marianne;
`

const Date = styled.span`
  font: normal normal normal 11px/15px Marianne;
`

const Natinf = styled.div`
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.gunMetal};
  font: normal normal medium 13px/18px Marianne;
  margin-top: 10px;
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
