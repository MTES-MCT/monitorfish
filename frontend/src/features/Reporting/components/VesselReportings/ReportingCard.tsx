import { getReportingActor } from '@features/Reporting/components/VesselReportings/utils'
import { getDateTime } from '@utils/getDateTime'
import { useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { ReportingType } from '../../../../domain/types/reporting'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import ArchiveIconSVG from '../../../icons/Bouton_archiver.svg?react'
import EditIconSVG from '../../../icons/Bouton_editer.svg?react'
import DeleteIconSVG from '../../../icons/Bouton_supprimer.svg?react'
import InfractionSuspicionIconSVG from '../../../icons/Icone_alerte_signalement_rouge_16.svg?react'
import ObservationIconSVG from '../../../icons/Icone_observations.svg?react'
import { getAlertNameFromType } from '../../../SideWindow/Alert/AlertListAndReportingList/utils'
import { setEditedReporting } from '../../slice'
import { reportingIsAnInfractionSuspicion, ReportingTypeCharacteristics } from '../../types'
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

    return getReportingActor(reporting.value.reportingActor, reporting.value.controlUnit)
  }, [reporting, reportingName])

  return (
    <Wrapper data-cy="reporting-card" isInfractionSuspicion={isAnInfractionSuspicion}>
      <Icon>{isAnInfractionSuspicion ? <InfractionSuspicionIcon /> : <ObservationIcon />}</Icon>
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
          {(reporting.type === ReportingType.OBSERVATION || reporting.type === ReportingType.INFRACTION_SUSPICION) && (
            <EditButton
              data-cy={`edit-reporting-card-${reporting.id}`}
              onClick={() => dispatch(setEditedReporting(reporting))}
              title="Editer"
            />
          )}
          <ArchiveButton
            $isAlert={!!numberOfAlerts}
            data-cy="archive-reporting-card"
            onClick={() => dispatch(archiveReporting(reporting.id))}
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

const Wrapper = styled.div<{
  isInfractionSuspicion?: boolean
}>`
  background: ${p => (p.isInfractionSuspicion ? '#E1000F1A' : COLORS.gainsboro)} 0% 0% no-repeat padding-box;
  display: flex;
  margin-bottom: 16px;
`

const Icon = styled.div`
  width: 45px;
`

const Body = styled.div<{
  isInfractionSuspicion?: boolean
}>`
  color: ${p => (p.isInfractionSuspicion ? COLORS.maximumRed : COLORS.gunMetal)};
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
  padding-left: 1px;
  text-align: center;
  width: 29px;
  margin-left: auto;
`

const NumberOfAlerts = styled.span`
  background: ${COLORS.maximumRed} 0% 0% no-repeat padding-box;
  border-radius: 2px;
  color: ${COLORS.white};
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
  background: ${COLORS.white};
  color: ${COLORS.gunMetal};
  font: normal normal medium 13px/18px Marianne;
  margin-top: 10px;
  padding: 2px 8px;
  width: fit-content;
`

const Description = styled.div`
  color: ${COLORS.gunMetal};
  font: normal normal bold 13px/18px Marianne;
  margin-top: 10px;
  white-space: normal;
`

const Author = styled.div`
  color: ${COLORS.gunMetal};
  font: normal normal normal 13px/18px Marianne;
`

const ObservationIcon = styled(ObservationIconSVG)`
  margin-left: 10px;
  margin-top: 13px;
  width: 25px;
`

const InfractionSuspicionIcon = styled(InfractionSuspicionIconSVG)`
  margin-left: 12px;
  margin-top: 12px;
  width: 20px;
`

const ArchiveButton = styled(ArchiveIconSVG)<{
  $isAlert: boolean
}>`
  cursor: pointer;
  margin-top: ${p => (p.$isAlert ? 11 : 7)}px;
`

const EditButton = styled(EditIconSVG)`
  cursor: pointer;
  margin-top: 7px;
`

const DeleteButton = styled(DeleteIconSVG)`
  cursor: pointer;
  height: 15px;
  margin-bottom: 10px;
  margin-top: 7px;
  width: 15px;
`
