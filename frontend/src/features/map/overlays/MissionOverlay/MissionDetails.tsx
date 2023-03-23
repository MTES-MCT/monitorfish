import styled from 'styled-components'

import { margins } from './constants'
import { Mission } from '../../../../domain/entities/mission/types'
import { OverlayPosition } from '../Overlay'

import type { ControlUnit } from '../../../../domain/types/controlUnit'

import MissionStatus = Mission.MissionStatus

type MissionDetailsProps = {
  mission: Mission.MissionPointFeatureProperties
  overlayPosition: OverlayPosition
}
export function MissionDetails({ mission, overlayPosition }: MissionDetailsProps) {
  return (
    <>
      <Wrapper>
        <ZoneText data-cy="mission-label-text">
          <Title>
            {mission.controlUnits.map((controlUnit: ControlUnit) => (
              <>
                <div>{controlUnit.name.toUpperCase()}</div>
                {controlUnit.contact && <div>{controlUnit.contact}</div>}
              </>
            ))}
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
      </Wrapper>
      <TrianglePointer>
        {overlayPosition === OverlayPosition.BOTTOM && <BottomTriangleShadow />}
        {overlayPosition === OverlayPosition.TOP && <TopTriangleShadow />}
        {overlayPosition === OverlayPosition.RIGHT && <RightTriangleShadow />}
        {overlayPosition === OverlayPosition.LEFT && <LeftTriangleShadow />}
      </TrianglePointer>
    </>
  )
}

const Details = styled.div`
  margin-top: 8px;
  color: ${p => p.theme.color.slateGray};
`

const Title = styled.div`
  font: normal normal bold 13px/18px Marianne;
  color: ${p => p.theme.color.gunMetal};
`

const Wrapper = styled.div`
  box-shadow: 0px 3px 6px #70778540;
  line-height: 20px;
  cursor: grabbing;
  text-align: left;
  height: 168px;
  width: 260px;
  display: flex;
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

const ZoneText = styled.span`
  margin: 12px;
  font-size: 13px;
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
