import { Tag, TagBullet } from '@mtes-mct/monitor-ui'
import { uniq } from 'lodash/fp'
import styled from 'styled-components'

import { Mission, type MissionWithActions } from '../../../domain/entities/mission/types'
import { FrontendError } from '../../../libs/FrontendError'
import { getMissionColor } from '../../map/layers/Mission/MissionLayer/styles'

import type { ControlUnit } from '../../../domain/types/controlUnit'

export function getControlUnitsNamesFromAdministrations(
  controlUnits: ControlUnit.ControlUnit[],
  administrations: string[]
): string[] {
  const names = controlUnits
    .filter(({ administration }) => administrations.includes(administration))
    .map(({ name }) => name)
  const uniqueNames = uniq(names)
  const uniqueSortedNames = uniqueNames.sort()

  return uniqueSortedNames
}

export function hasSomeOngoingActions(mission: MissionWithActions): boolean {
  return !mission.isClosed && mission.actions.filter(({ closedBy }) => !closedBy).length > 0
}

export const renderStatus = (missionStatus: Mission.MissionStatus): JSX.Element => {
  switch (missionStatus) {
    case Mission.MissionStatus.UPCOMING: {
      const color = getMissionColor(Mission.MissionStatus.UPCOMING, true)

      return (
        <StyledTag bullet={TagBullet.DISK} bulletColor={color} style={{ color }}>
          {Mission.MissionStatusLabel.UPCOMING}
        </StyledTag>
      )
    }

    case Mission.MissionStatus.IN_PROGRESS: {
      const color = getMissionColor(Mission.MissionStatus.IN_PROGRESS, true)

      return (
        <StyledTag bullet={TagBullet.DISK} bulletColor={color} style={{ color }}>
          {Mission.MissionStatusLabel.IN_PROGRESS}
        </StyledTag>
      )
    }

    case Mission.MissionStatus.DONE: {
      const color = getMissionColor(Mission.MissionStatus.DONE, true)

      return (
        <StyledTag bullet={TagBullet.DISK} bulletColor={color} style={{ color }}>
          {Mission.MissionStatusLabel.DONE}
        </StyledTag>
      )
    }

    case Mission.MissionStatus.CLOSED: {
      const color = getMissionColor(Mission.MissionStatus.CLOSED, true)

      return (
        <StyledTagWithCheck bulletColor={color} style={{ color }}>
          <span>✓</span>
          {Mission.MissionStatusLabel.CLOSED}
        </StyledTagWithCheck>
      )
    }

    default:
      throw new FrontendError("`missionStatus` doesn't match `MissionStatus` enum.")
  }
}

// TODO Remove this hack once we get rid of local CSS.
const StyledTag = styled(Tag)`
  align-items: flex-end;
  display: flex;
  line-height: 1;

  > span {
    height: 10px;
    margin-right: 6px;
    width: 10px;
  }
`

// TODO Add check in icons and `TagBullet` in monitor-ui.
const StyledTagWithCheck = styled(StyledTag)`
  > span {
    font-size: 16px;
    height: auto;
    line-height: 13px;
    margin-right: 6px;
    width: 10px;
  }
`
