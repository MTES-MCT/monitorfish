import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import {
  reportingIsAnInfractionSuspicion,
  ReportingOriginActor,
  ReportingTypeCharacteristics
} from '../../../domain/entities/reporting'
import { setEditedReporting } from '../../../domain/shared_slices/Reporting'
import { ReportingType, Reporting } from '../../../domain/types/reporting'
import archiveReporting from '../../../domain/use_cases/reporting/archiveReporting'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { getDateTime } from '../../../utils'
import { ReactComponent as ArchiveIconSVG } from '../../icons/Bouton_archiver.svg'
import { ReactComponent as EditIconSVG } from '../../icons/Bouton_editer.svg'
import { ReactComponent as DeleteIconSVG } from '../../icons/Bouton_supprimer.svg'
import { ReactComponent as InfractionSuspicionIconSVG } from '../../icons/Icone_alerte_signalement_rouge_16.svg'
import { ReactComponent as ObservationIconSVG } from '../../icons/Icone_observations.svg'
import { getAlertNameFromType } from '../../side_window/alerts_reportings/utils'

import type { Promisable } from 'type-fest'

export type ReportingCardProps = {
  isArchive?: boolean
  numberOfAlerts?: number
  openConfirmDeletionModalForId: (reportingId: string) => Promisable<void>
  // TODO Doesn't respect ReportingCard type from domain. Can it be undefined (wouldn't make sense)?
  reporting: Reporting
}
export function ReportingCard({
  isArchive = false,
  numberOfAlerts,
  openConfirmDeletionModalForId,
  reporting
}: ReportingCardProps) {
  const dispatch = useAppDispatch()
  const isAnInfractionSuspicion = reportingIsAnInfractionSuspicion(reporting.type)
  const reportingName = Object.values(ReportingTypeCharacteristics).find(
    reportingType => reportingType.code === reporting.type
  )?.name

  return (
    <Wrapper data-cy="reporting-card" isInfractionSuspicion={isAnInfractionSuspicion}>
      <Icon>{isAnInfractionSuspicion ? <InfractionSuspicionIcon /> : <ObservationIcon />}</Icon>
      <Body isInfractionSuspicion={isAnInfractionSuspicion}>
        <Title>
          {reporting.type === ReportingType.ALERT
            ? reportingName
            : getReportingActor(reporting.value.reportingActor, reporting.value.unit)}{' '}
          /{' '}
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
        {reporting.type !== ReportingType.ALERT && reporting.value.authorContact && (
          <Author>Émetteur: {reporting.value.authorContact}</Author>
        )}
        {reporting.type !== ReportingType.OBSERVATION && reporting.value.natinfCode && (
          <Natinf
            title={
              reporting.infraction
                ? `${reporting.infraction?.natinfCode || ''}: ${
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
          {(reporting.type === ReportingType.OBSERVATION || reporting.type === ReportingType.INFRACTION_SUSPICION) && (
            <EditButton
              data-cy={`edit-reporting-card-${reporting.id}`}
              onClick={() => dispatch(setEditedReporting(reporting))}
              title="Editer"
            />
          )}
          <ArchiveButton
            data-cy="archive-reporting-card"
            isAlert={!!numberOfAlerts}
            onClick={() => dispatch(archiveReporting(reporting.id) as any)}
            title="Archiver"
          />
          <DeleteButton
            data-cy="delete-reporting-card"
            onClick={() => openConfirmDeletionModalForId(reporting.id)}
            title="Supprimer"
          />
        </Actions>
      )}
    </Wrapper>
  )
}

const getReportingActor = (reportingActor, unit) => {
  switch (reportingActor) {
    case ReportingOriginActor.UNIT.code:
      return unit
    default:
      return reportingActor
  }
}

const Wrapper = styled.div<{
  isInfractionSuspicion?: boolean
}>`
  margin-bottom: 10px;
  display: flex;
  background: ${p => (p.isInfractionSuspicion ? '#E1000F1A' : COLORS.cultured)} 0% 0% no-repeat padding-box;
  border: 1px solid ${p => (p.isInfractionSuspicion ? '#E1000F59' : COLORS.lightGray)};
`

const Icon = styled.div`
  width: 45px;
`

const Body = styled.div<{
  isInfractionSuspicion?: boolean
}>`
  width: 365px;
  margin-top: 12px;
  margin-bottom: 12px;
  color: ${p => (p.isInfractionSuspicion ? COLORS.maximumRed : COLORS.gunMetal)};
`

const Actions = styled.div<{
  isAlert: boolean
  isInfractionSuspicion?: boolean
}>`
  padding-top: ${p => (p.isAlert ? 8 : 3)}px;
  width: 30px;
  text-align: center;
  border-left: 1px solid ${p => (p.isInfractionSuspicion ? '#E1000F59' : COLORS.lightGray)};
`

const NumberOfAlerts = styled.span`
  padding: 0px 5.5px;
  background: ${COLORS.maximumRed} 0% 0% no-repeat padding-box;
  border-radius: 2px;
  color: ${COLORS.white};
  font-weight: 500;
  height: 17px;
  display: inline-block;
  line-height: 16px;
`

const Title = styled.div`
  font: normal normal bold 13px/18px Marianne;
`

const Date = styled.span`
  font: normal normal normal 11px/15px Marianne;
`

const Natinf = styled.div`
  padding: 2px 8px 2px 8px;
  background: ${COLORS.white};
  font: normal normal medium 13px/18px Marianne;
  width: fit-content;
  margin-top: 10px;
  color: ${COLORS.gunMetal};
`

const Description = styled.div`
  margin-top: 10px;
  font: normal normal bold 13px/18px Marianne;
  color: ${COLORS.gunMetal};
  white-space: normal;
`

const Author = styled.div`
  font: normal normal normal 13px/18px Marianne;
  color: ${COLORS.gunMetal};
`

const ObservationIcon = styled(ObservationIconSVG)`
  width: 25px;
  margin-top: 13px;
  margin-left: 10px;
`

const InfractionSuspicionIcon = styled(InfractionSuspicionIconSVG)`
  width: 20px;
  margin-top: 12px;
  margin-left: 12px;
`

const ArchiveButton = styled(ArchiveIconSVG)<{
  isAlert: boolean
}>`
  cursor: pointer;
  margin-top: ${p => (p.isAlert ? 11 : 7)}px;
`

const EditButton = styled(EditIconSVG)`
  cursor: pointer;
  margin-top: 7px;
`

const DeleteButton = styled(DeleteIconSVG)`
  cursor: pointer;
  margin-top: 7px;
  margin-bottom: 10px;
  width: 15px;
  height: 15px;
`
