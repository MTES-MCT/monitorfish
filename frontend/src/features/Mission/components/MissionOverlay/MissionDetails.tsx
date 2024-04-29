import { Bold } from '@components/style'
import { CompletionStatusTag } from '@features/Mission/components/MissionForm/shared/CompletionStatusTag'
import { MissionStatusTag } from '@features/Mission/components/MissionForm/shared/MissionStatusTag'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button, Icon, IconButton, Size } from '@mtes-mct/monitor-ui'
import { pluralize } from '@utils/pluralize'
import { Fragment } from 'react'
import styled from 'styled-components'

import { margins } from './constants'
import { OverlayPosition } from '../../../map/overlays/Overlay'
import { Mission } from '../../mission.types'
import { editMission } from '../../useCases/editMission'
import { missionFormActions } from '../MissionForm/slice'

import type { LegacyControlUnit } from '../../../../domain/types/legacyControlUnit'

type MissionDetailsProps = Readonly<{
  isSelected: boolean
  mission: Mission.MissionPointFeatureProperties
  overlayPosition: OverlayPosition
}>
export function MissionDetails({ isSelected, mission, overlayPosition }: MissionDetailsProps) {
  const dispatch = useMainAppDispatch()

  const openMissionInSideWindow = () => {
    dispatch(editMission(mission.missionId))
  }

  function getActions() {
    let actions: string[] = []
    if (mission.hasEnvActions) {
      actions = actions.concat('CACEM')
    }
    if (mission.hasFishActions) {
      actions = actions.concat('CNSP')
    }

    if (actions.length === 0) {
      return 'Aucune action'
    }

    if (actions.length === 1) {
      return (
        <>
          Actions <Bold>{actions[0]}</Bold>
        </>
      )
    }

    return (
      <>
        Actions <Bold>CACEM</Bold> et <Bold>CNSP</Bold>
      </>
    )
  }

  return (
    <>
      <Wrapper data-cy="mission-overlay">
        {isSelected && (
          <CloseButton
            accent={Accent.TERTIARY}
            data-cy="mission-overlay-close"
            Icon={Icon.Close}
            iconSize={14}
            onClick={() => dispatch(missionFormActions.unsetSelectedMissionGeoJSON())}
          />
        )}
        <Body>
          <Title isSelected={isSelected}>
            {mission.controlUnits.length === 1 &&
              mission.controlUnits.map((controlUnit: LegacyControlUnit.LegacyControlUnit) => (
                <Fragment key={controlUnit.id}>
                  <TextWithEllipsis>{controlUnit.name.toUpperCase()}</TextWithEllipsis>
                  {controlUnit.contact ? (
                    <TextWithEllipsis>{controlUnit.contact}</TextWithEllipsis>
                  ) : (
                    <NoContact>Aucun contact renseigné</NoContact>
                  )}
                </Fragment>
              ))}
            {mission.controlUnits.length > 1 && mission.controlUnits[0] && (
              <>
                <div>{mission.controlUnits[0].name.toUpperCase()}</div>
                <MultipleControlUnits>
                  et {mission.controlUnits.length - 1} {pluralize('autre', mission.controlUnits.length - 1)}{' '}
                  {pluralize('unité', mission.controlUnits.length - 1)}
                </MultipleControlUnits>
              </>
            )}
          </Title>
          <Details>
            <MissionStatusTag status={mission.missionStatus} />
            <CompletionStatusTag completion={mission.missionCompletion} />
            <Text>
              <Line>
                Mission {mission.missionTypes.map(missionType => Mission.MissionTypeLabel[missionType]).join(' / ')} –{' '}
                {mission.startDateTimeUtc}
              </Line>
              <Line>
                {mission.numberOfControls} {pluralize('contrôle', mission.numberOfControls)}{' '}
                {pluralize('réalisé', mission.numberOfControls)}
              </Line>
              <Line>{getActions()}</Line>
            </Text>
          </Details>
        </Body>
        <EditButton
          accent={Accent.PRIMARY}
          disabled={!isSelected}
          Icon={Icon.EditUnbordered}
          onClick={openMissionInSideWindow}
          size={Size.SMALL}
        >
          Editer la mission
        </EditButton>
      </Wrapper>
      {!isSelected && (
        <TrianglePointer>
          {overlayPosition === OverlayPosition.BOTTOM && <BottomTriangleShadow />}
          {overlayPosition === OverlayPosition.TOP && <TopTriangleShadow />}
          {overlayPosition === OverlayPosition.RIGHT && <RightTriangleShadow />}
          {overlayPosition === OverlayPosition.LEFT && <LeftTriangleShadow />}
        </TrianglePointer>
      )}
    </>
  )
}

const Line = styled.span`
  display: block;
`

const Text = styled.div`
  margin-top: 12px;
  line-height: 18px;
`

const TextWithEllipsis = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

const NoContact = styled.div`
  color: ${p => p.theme.color.slateGray};
  font-weight: 400;
  font-style: italic;
`

const MultipleControlUnits = styled.div`
  color: ${p => p.theme.color.slateGray};
`

const EditButton = styled(Button)`
  margin-left: 12px;
  margin-top: 12px;
`

const CloseButton = styled(IconButton)`
  position: absolute;
  right: 0;
  margin: 5px;
`

const Details = styled.div`
  margin-top: 8px;
  color: ${p => p.theme.color.slateGray};
  display: flex;
  flex-wrap: wrap;

  .Element-Tag {
    margin-right: 8px;
  }
`

const Title = styled.div<{
  isSelected: boolean
}>`
  height: 40px;
  font: normal normal bold 13px/18px Marianne;
  color: ${p => p.theme.color.gunMetal};
  width: ${p => (p.isSelected ? 90 : 100)}%;
`

const Wrapper = styled.div`
  padding-top: 1px;
  box-shadow: 0px 3px 6px #70778540;
  line-height: 20px;
  text-align: left;
  height: 201px;
  width: 260px;
  border-radius: 1px;
  background-color: ${p => p.theme.color.white};
`

const Body = styled.div`
  margin: 12px 12px 0px 12px;
  font-size: 13px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

const TrianglePointer = styled.div`
  margin-left: auto;
  margin-right: auto;
  height: auto;
  width: auto;
`

const BottomTriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 11px 6px 0 6px;
  border-color: ${p => p.theme.color.white} transparent transparent transparent;
  margin-left: ${-margins.xMiddle - 6}px;
  margin-top: -4px;
  clear: top;
`

const TopTriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-top: transparent;
  border-right: 6px solid transparent;
  border-bottom: 11px solid ${p => p.theme.color.white};
  border-left: 6px solid transparent;
  margin-left: ${-margins.xMiddle - 6}px;
  margin-top: ${margins.yBottom + 45}px;
  clear: top;
`

const RightTriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-right: transparent;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 11px solid ${p => p.theme.color.white};
  margin-left: ${-margins.xRight - 40}px;
  margin-top: ${margins.yMiddle + 25}px;
  clear: top;
`

const LeftTriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-top: 6px solid transparent;
  border-right: 11px solid ${p => p.theme.color.white};
  border-bottom: 6px solid transparent;
  border-left: transparent;
  margin-left: -11px;
  margin-top: ${margins.yMiddle + 25}px;
  clear: top;
`
