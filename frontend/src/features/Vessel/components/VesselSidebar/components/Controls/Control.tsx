import { MissionAction } from '@features/Mission/missionAction.types'
import { editMission } from '@features/Mission/useCases/editMission'
import { VesselSidebarTab } from '@features/Vessel/types/vessel'
import { VesselTrackDepth } from '@features/Vessel/types/vesselTrackDepth'
import { openVesselSidebarTab } from '@features/Vessel/useCases/openVesselSidebarTab'
import { updateVesselTrackAndLogbookFromDates } from '@features/Vessel/useCases/updateVesselTrackAndLogbookFromDates'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, customDayjs, Icon, Size, Tag, TagGroup, THEME } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import styled from 'styled-components'

import { GearOnboard } from './GearOnboard'
import { Infraction } from './Infraction'
import { useIsSuperUser } from '../../../../../../auth/hooks/useIsSuperUser'
import {
  getNumberOfInfractionsWithoutRecord,
  getNumberOfInfractionsWithRecord
} from '../../../../../../domain/entities/controls'
import { getDate } from '../../../../../../utils'

import type { TrackRequestCustom } from '@features/Vessel/types/types'

type ControlProps = Readonly<{
  control: MissionAction.MissionAction
  isLastItem: boolean
}>
export function Control({ control, isLastItem }: ControlProps) {
  const isSuperUser = useIsSuperUser()
  const dispatch = useMainAppDispatch()
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  assertNotNullish(selectedVesselIdentity)

  const numberOfInfractionsWithRecord = getNumberOfInfractionsWithRecord(control)
  const numberOfInfractionsWithoutRecord = getNumberOfInfractionsWithoutRecord(control)
  const numberOfInfractions = numberOfInfractionsWithRecord + numberOfInfractionsWithoutRecord
  const gearAndSpeciesInfractionsLength = control.gearInfractions.length + control.speciesInfractions.length
  const gearSpeciesAndLogbookInfractionsLength =
    control.gearInfractions.length + control.speciesInfractions.length + control.logbookInfractions.length

  const openMission = () => {
    dispatch(editMission(control.missionId))
  }

  const openTripForControl = async () => {
    const controlDate = customDayjs(control.actionDatetimeUtc)
    const fromDate = controlDate.subtract(2, 'days')
    const toDate = controlDate.add(2, 'days')
    const trackRequest: TrackRequestCustom = {
      afterDateTime: fromDate.toDate(),
      beforeDateTime: toDate.toDate(),
      trackDepth: VesselTrackDepth.CUSTOM
    }

    await dispatch(updateVesselTrackAndLogbookFromDates(selectedVesselIdentity, trackRequest))
    dispatch(openVesselSidebarTab(VesselSidebarTab.VOYAGES))
  }

  const controlType = (function () {
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
  })()

  const controlPort = (function () {
    switch (control.actionType) {
      case MissionAction.MissionActionType.LAND_CONTROL:
        return `${control.portName?.toUpperCase()} (${control.portLocode?.toUpperCase()})`
      default:
        return ''
    }
  })()

  const controlTitle = `CONTRÔLE ${controlType} DU ${getDate(control.actionDatetimeUtc)}`

  return (
    <Wrapper isLastItem={isLastItem}>
      <GyroColumn>
        {numberOfInfractionsWithRecord > 0 && <StyledControlUnitFilled color={THEME.color.maximumRed} />}
        {numberOfInfractionsWithoutRecord > 0 && !numberOfInfractionsWithRecord && (
          <StyledControlUnitFilled color={THEME.color.goldenPoppy} />
        )}
        {!numberOfInfractions && <StyledControlUnitFilled color={THEME.color.mediumSeaGreen} />}
      </GyroColumn>
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
              <Tag Icon={Icon.CircleFilled} iconColor={THEME.color.maximumRed} isLight withCircleIcon>
                Appréhension engin
              </Tag>
            )}
            {control.hasSomeSpeciesSeized && (
              <Tag Icon={Icon.CircleFilled} iconColor={THEME.color.maximumRed} isLight withCircleIcon>
                Appréhension espèce
              </Tag>
            )}
          </StyledTagGroup>
        )}
        {control.gearInfractions.map((infraction, index) => (
          <Infraction
            key={`${infraction.infractionType}${infraction.natinf}${infraction.comments}`}
            index={index + 1}
            infraction={infraction}
            infractionDomain={MissionAction.InfractionDomain.GEAR}
          />
        ))}
        {control.speciesInfractions.map((infraction, index) => (
          <Infraction
            key={`${infraction.infractionType}${infraction.natinf}${infraction.comments}`}
            index={control.gearInfractions.length + index + 1}
            infraction={infraction}
            infractionDomain={MissionAction.InfractionDomain.SPECIES}
          />
        ))}
        {control.logbookInfractions.map((infraction, index) => (
          <Infraction
            key={`${infraction.infractionType}${infraction.natinf}${infraction.comments}`}
            index={gearAndSpeciesInfractionsLength + index + 1}
            infraction={infraction}
            infractionDomain={MissionAction.InfractionDomain.LOGBOOK}
          />
        ))}
        {control.otherInfractions.map((infraction, index) => (
          <Infraction
            key={`${infraction.infractionType}${infraction.natinf}${infraction.comments}`}
            index={gearSpeciesAndLogbookInfractionsLength + index + 1}
            infraction={infraction}
            infractionDomain={MissionAction.InfractionDomain.OTHER}
          />
        ))}
        {control.gearOnboard.map(gear => (
          <GearOnboard key={JSON.stringify(gear)} gearOnboard={gear} />
        ))}
        {control.otherComments && (
          <OtherComments>
            <OtherCommentsTitle>Observations</OtherCommentsTitle>
            {control.otherComments}
          </OtherComments>
        )}
        {isSuperUser && (
          <StyledButton accent={Accent.SECONDARY} Icon={Icon.MissionAction} onClick={openMission} size={Size.SMALL}>
            Ouvrir le contrôle
          </StyledButton>
        )}
        <StyledButton accent={Accent.SECONDARY} Icon={Icon.Fishery} onClick={openTripForControl} size={Size.SMALL}>
          Voir la marée du contrôle
        </StyledButton>
      </ContentColumn>
    </Wrapper>
  )
}

const StyledButton = styled(Button)`
  margin-top: 16px;
  margin-right: 8px;
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
  color: ${p => p.theme.color.gunMetal};
  display: flex;
  white-space: initial;
`

const GyroColumn = styled.div``
const ContentColumn = styled.div`
  width: 100%;
  box-sizing: border-box;
`

const StyledControlUnitFilled = styled(Icon.ControlUnitFilled)`
  margin-right: 8px;
`

const StyledTagGroup = styled(TagGroup)`
  margin: 0 0 8px;
`
