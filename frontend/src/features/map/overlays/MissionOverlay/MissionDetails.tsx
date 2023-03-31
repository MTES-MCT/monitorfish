import { Accent, Button, Icon, IconButton, Size } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { margins } from './constants'
import { missionActions } from '../../../../domain/actions'
import { Mission } from '../../../../domain/entities/mission/types'
import { openSideWindowTab } from '../../../../domain/shared_slices/Global'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { SideWindowMenuKey } from '../../../SideWindow/constants'
import { OverlayPosition } from '../Overlay'

import type { ControlUnit } from '../../../../domain/types/controlUnit'

import MissionStatus = Mission.MissionStatus

type MissionDetailsProps = {
  isSelected: boolean
  mission: Mission.MissionPointFeatureProperties
  overlayPosition: OverlayPosition
}
export function MissionDetails({ isSelected, mission, overlayPosition }: MissionDetailsProps) {
  const dispatch = useMainAppDispatch()

  const openMissionInSideWindow = () => {
    dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_FORM))
    dispatch(missionActions.setDraftId(mission.missionId))
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
            onClick={() => dispatch(missionActions.unsetSelectedMissionGeoJSON())}
          />
        )}
        <ZoneText>
          <Title>
            {mission.controlUnits.length === 1 &&
              mission.controlUnits.map((controlUnit: ControlUnit.ControlUnit) => (
                <>
                  <div>{controlUnit.name.toUpperCase()}</div>
                  {controlUnit.contact ? (
                    <div>{controlUnit.contact}</div>
                  ) : (
                    <NoContact>Aucun contact renseigné</NoContact>
                  )}
                </>
              ))}
            {mission.controlUnits.length > 1 && mission.controlUnits[0] && (
              <>
                <div>{mission.controlUnits[0].name.toUpperCase()}</div>
                <MultipleControlUnits>
                  et {mission.controlUnits.length - 1} autre{mission.controlUnits.length - 1 > 1 && 's'} unité
                  {mission.controlUnits.length - 1 > 1 && 's'}
                </MultipleControlUnits>
              </>
            )}
          </Title>
          <Details>
            <div>
              Mission {mission.missionType} – {mission.startDateTimeUtc}
            </div>
            <div>
              {mission.numberOfControls} contrôle{mission.numberOfControls > 1 && 's'} réalisé
              {mission.numberOfControls > 0 && 's'}
            </div>
            <div>
              {mission.missionStatus === MissionStatus.IN_PROGRESS && <InProgressIcon />}
              {mission.missionStatus}
            </div>
          </Details>
        </ZoneText>
        <EditButton
          accent={Accent.PRIMARY}
          disabled={!isSelected}
          Icon={Icon.Calendar}
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
`

const Title = styled.div`
  height: 40px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font: normal normal bold 13px/18px Marianne;
  color: ${p => p.theme.color.gunMetal};
`

const Wrapper = styled.div`
  padding-top: 1px;
  box-shadow: 0px 3px 6px #70778540;
  line-height: 20px;
  text-align: left;
  height: 168px;
  width: 260px;
  border-radius: 1px;
  background-color: ${p => p.theme.color.white};
`

const InProgressIcon = styled.span`
  height: 8px;
  width: 8px;
  margin-right: 5px;
  background-color: #33a02c;
  border-radius: 50%;
  display: inline-block;
`

const ZoneText = styled.div`
  margin: 11px 12px 0px 12px;
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
