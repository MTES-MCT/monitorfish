import { Accent, Button, Tag, TagBullet, TagGroup, THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { GearOnboard } from './GearOnboard'
import { Infraction } from './Infraction'
import { COLORS } from '../../../constants/constants'
import { getNumberOfInfractions } from '../../../domain/entities/controls'
import { SideWindowMenuKey } from '../../../domain/entities/sideWindow/constants'
import { MissionAction } from '../../../domain/types/missionAction'
import { sideWindowDispatchers } from '../../../domain/use_cases/sideWindow'
import { useIsSuperUser } from '../../../hooks/authorization/useIsSuperUser'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { getDate } from '../../../utils'
import GyroRedSVG from '../../icons/Gyrophare_controles_rouge.svg?react'
import GyroGreenSVG from '../../icons/Gyrophare_controles_vert.svg?react'

type ControlProps = {
  control: MissionAction.MissionAction
  isLastItem: boolean
}

export function Control({ control, isLastItem }: ControlProps) {
  const isSuperUser = useIsSuperUser()
  const dispatch = useMainAppDispatch()
  const numberOfInfractions = useMemo(() => getNumberOfInfractions(control), [control])
  const gearAndSpeciesInfractionsLength = useMemo(
    () => control.gearInfractions.length + control.speciesInfractions.length,
    [control]
  )
  const gearSpeciesAndLogbookInfractionsLength = useMemo(
    () => control.gearInfractions.length + control.speciesInfractions.length + control.logbookInfractions.length,
    [control]
  )

  const openMission = useCallback(async () => {
    dispatch(sideWindowDispatchers.openPath({ id: control.missionId, menu: SideWindowMenuKey.MISSION_FORM }))
  }, [dispatch, control.missionId])

  const controlType = useMemo(() => {
    switch (control.actionType) {
      case MissionAction.MissionActionType.AIR_CONTROL:
        return 'AÉRIEN'
      case MissionAction.MissionActionType.LAND_CONTROL:
        return `À QUAI`
      case MissionAction.MissionActionType.SEA_CONTROL:
        return 'EN MER'
      default:
        return ''
    }
  }, [control])

  const controlPort = useMemo(() => {
    switch (control.actionType) {
      case MissionAction.MissionActionType.LAND_CONTROL:
        return `${control.portName?.toUpperCase()} (${control.portLocode?.toUpperCase()})`
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
        <Title data-cy="vessel-control-title" title={`${controlTitle} ${controlPort}`}>
          {controlTitle}
          {controlPort && (
            <>
              <br />
              {controlPort}
            </>
          )}
          <br />
          <Unit>
            {control.controlUnits
              .map(controlUnit => `${controlUnit.name.replace('(historique)', '')} – ${controlUnit.administration}`)
              .join(', ')}
          </Unit>
        </Title>
        {!numberOfInfractions && <NoInfraction>Pas d’infraction</NoInfraction>}
        {(control.hasSomeGearsSeized || control.hasSomeSpeciesSeized) && (
          <StyledTagGroup>
            {control.hasSomeGearsSeized && (
              <Tag bullet={TagBullet.DISK} bulletColor={THEME.color.maximumRed} isLight>
                Appréhension engin
              </Tag>
            )}
            {control.hasSomeSpeciesSeized && (
              <Tag bullet={TagBullet.DISK} bulletColor={THEME.color.maximumRed} isLight>
                Appréhension espèce
              </Tag>
            )}
          </StyledTagGroup>
        )}
        {control.gearInfractions.map((infraction, index) => (
          <Infraction
            key={`${infraction.infractionType}${infraction.natinf}`}
            index={index + 1}
            infraction={infraction}
            infractionDomain={MissionAction.InfractionDomain.GEAR}
          />
        ))}
        {control.speciesInfractions.map((infraction, index) => (
          <Infraction
            key={`${infraction.infractionType}${infraction.natinf}`}
            index={control.gearInfractions.length + index + 1}
            infraction={infraction}
            infractionDomain={MissionAction.InfractionDomain.SPECIES}
          />
        ))}
        {control.logbookInfractions.map((infraction, index) => (
          <Infraction
            key={`${infraction.infractionType}${infraction.natinf}`}
            index={gearAndSpeciesInfractionsLength + index + 1}
            infraction={infraction}
            infractionDomain={MissionAction.InfractionDomain.LOGBOOK}
          />
        ))}
        {control.otherInfractions.map((infraction, index) => (
          <Infraction
            key={`${infraction.infractionType}${infraction.natinf}`}
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
        {isSuperUser && (
          <ModifyButton accent={Accent.SECONDARY} onClick={openMission}>
            Modifier le CR du contrôle
          </ModifyButton>
        )}
      </ContentColumn>
    </Wrapper>
  )
}

const ModifyButton = styled(Button)`
  margin-top: 10px;
`

const OtherCommentsTitle = styled.div`
  font-weight: bold;
`

const OtherComments = styled.div`
  margin-top: 16px;
  white-space: normal;
  width: 100%;
  padding-right: 24px;
  box-sizing: border-box;
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
  margin-bottom: 8px;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: inherit;
  max-width: 400px;
  padding-right: 24px;
`

const Wrapper = styled.div<{
  isLastItem: boolean
}>`
  background: ${p => p.theme.color.gainsboro};
  width: -moz-available;
  width: -webkit-fill-available;
  margin: 16px;
  padding: 12px 24px 16px 12px;
  color: ${COLORS.gunMetal};
  display: flex;
  white-space: initial;
`

const GyroColumn = styled.div``
const ContentColumn = styled.div`
  width: 100%;
  box-sizing: border-box;
`

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

const StyledTagGroup = styled(TagGroup)`
  margin: 0 0 8px;
`
