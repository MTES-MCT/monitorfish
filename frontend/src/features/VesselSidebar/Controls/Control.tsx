import { useMemo } from 'react'
import styled from 'styled-components'

import { GearOnboard } from './GearOnboard'
import { Infraction } from './Infraction'
import { COLORS } from '../../../constants/constants'
import { getNumberOfInfractions } from '../../../domain/entities/controls'
import { MissionAction } from '../../../domain/types/missionAction'
import { getDate } from '../../../utils'
import { ReactComponent as GyroRedSVG } from '../../icons/Gyrophare_controles_rouge.svg'
import { ReactComponent as GyroGreenSVG } from '../../icons/Gyrophare_controles_vert.svg'

type ControlProps = {
  control: MissionAction.MissionAction
  isLastItem: boolean
}

export function Control({ control, isLastItem }: ControlProps) {
  const numberOfInfractions = useMemo(() => getNumberOfInfractions(control), [control])
  const gearAndSpeciesInfractionsLength = useMemo(
    () => control.gearInfractions.length + control.speciesInfractions.length,
    [control]
  )
  const gearSpeciesAndLogbookInfractionsLength = useMemo(
    () => control.gearInfractions.length + control.speciesInfractions.length + control.logbookInfractions.length,
    [control]
  )

  const controlType = useMemo(() => {
    switch (control.actionType) {
      case MissionAction.MissionActionType.AIR_CONTROL:
        return 'EN MER'
      case MissionAction.MissionActionType.LAND_CONTROL:
        return `À QUAI (${control.portName?.toUpperCase()})`
      case MissionAction.MissionActionType.SEA_CONTROL:
        return 'AÉRIEN'
      default:
        return ''
    }
  }, [control])

  const controlTitle = useMemo(
    () => `CONTRÔLE ${controlType} DU ${getDate(control.actionDatetimeUtc)}`,
    [control, controlType]
  )

  return (
    <Wrapper isLastItem={isLastItem}>
      <GyroColumn>{numberOfInfractions ? <GyroRed /> : <GyroGreen />}</GyroColumn>
      <ContentColumn data-cy="vessel-control">
        <Title data-cy="vessel-control-title" title={controlTitle}>
          {controlTitle}
          <br />
          <Unit>
            {control.controlUnits.map(controlUnit => `${controlUnit.name} (${controlUnit.administration})`).join(', ')}
          </Unit>
        </Title>
        <NoInfraction>{!numberOfInfractions && "Pas d'infraction"}</NoInfraction>
        {control.gearInfractions.map((infraction, index) => (
          <Infraction
            key={infraction.infractionType + infraction.natinf}
            index={index + 1}
            infraction={infraction}
            infractionDomain={MissionAction.InfractionDomain.GEAR}
          />
        ))}
        {control.speciesInfractions.map((infraction, index) => (
          <Infraction
            key={infraction.infractionType + infraction.natinf}
            index={control.gearInfractions.length + index + 1}
            infraction={infraction}
            infractionDomain={MissionAction.InfractionDomain.SPECIES}
          />
        ))}
        {control.logbookInfractions.map((infraction, index) => (
          <Infraction
            key={infraction.infractionType + infraction.natinf}
            index={gearAndSpeciesInfractionsLength + index + 1}
            infraction={infraction}
            infractionDomain={MissionAction.InfractionDomain.LOGBOOK}
          />
        ))}
        {control.otherInfractions.map((infraction, index) => (
          <Infraction
            key={infraction.infractionType + infraction.natinf}
            index={gearSpeciesAndLogbookInfractionsLength + index + 1}
            infraction={infraction}
            infractionDomain={MissionAction.InfractionDomain.OTHER}
          />
        ))}
        {control.gearOnboard.map(gear => (
          <GearOnboard gearOnboard={gear} />
        ))}
        {control.otherComments && (
          <OtherComments>
            <OtherCommentsTitle>Observations</OtherCommentsTitle>
            {control.otherComments}
          </OtherComments>
        )}
      </ContentColumn>
    </Wrapper>
  )
}

const OtherCommentsTitle = styled.div`
  font-weight: bold;
`

const OtherComments = styled.div`
  margin-top: 16px;
  white-space: normal;
  width: 100%;
`

const NoInfraction = styled.div`
  font-size: 13px;
  font-weight: bold;
`

const Unit = styled.span`
  font-weight: normal;
  font-size: 11px;
`

const Title = styled.div`
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 12px;
  height: 40px;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  max-width: 400px;
`

const Wrapper = styled.div<{
  isLastItem: boolean
}>`
  background: ${p => p.theme.color.gainsboro};
  width: -moz-available;
  width: -webkit-fill-available;
  margin: 16px;
  padding: 12px 12px 16px 12px;
  color: ${COLORS.gunMetal};
  display: flex;
`

const GyroColumn = styled.div``
const ContentColumn = styled.div``

const GyroGreen = styled(GyroGreenSVG)`
  width: 16px;
  margin: 0px 12px 0 2px;
  vertical-align: sub;
`

const GyroRed = styled(GyroRedSVG)`
  width: 16px;
  margin: 0px 12px 0 2px;
  vertical-align: sub;
`
