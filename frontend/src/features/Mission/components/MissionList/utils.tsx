import { FrontendError } from '@libs/FrontendError'
import { Tag } from '@mtes-mct/monitor-ui'
import { uniq } from 'lodash/fp'
import styled from 'styled-components'

import { getMissionColor } from '../../layers/MissionLayer/styles'
import { Mission, type MissionWithActions } from '../../mission.types'

import type { LegacyControlUnit } from '../../../../domain/types/legacyControlUnit'

export function getControlUnitsNamesFromAdministrations(
  controlUnits: LegacyControlUnit.LegacyControlUnit[],
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
        <Tag color={color} iconColor={color} withBullet>
          {Mission.MissionStatusLabel.UPCOMING}
        </Tag>
      )
    }

    case Mission.MissionStatus.IN_PROGRESS: {
      const color = getMissionColor(Mission.MissionStatus.IN_PROGRESS, true)

      return (
        <Tag color={color} iconColor={color} withBullet>
          {Mission.MissionStatusLabel.IN_PROGRESS}
        </Tag>
      )
    }

    case Mission.MissionStatus.DONE: {
      const color = getMissionColor(Mission.MissionStatus.DONE, true)

      return (
        <Tag color={color} iconColor={color} withBullet>
          {Mission.MissionStatusLabel.DONE}
        </Tag>
      )
    }

    case Mission.MissionStatus.CLOSED: {
      const color = getMissionColor(Mission.MissionStatus.CLOSED, true)

      return (
        <StyledTagWithCheck bulletColor={color} color={color}>
          <span>✓</span>
          {Mission.MissionStatusLabel.CLOSED}
        </StyledTagWithCheck>
      )
    }

    default:
      throw new FrontendError("`missionStatus` doesn't match `MissionStatus` enum.")
  }
}

const StyledTagWithCheck = styled(Tag)`
  align-items: flex-end;
  display: flex;
  line-height: 1;

  > span {
    font-size: 16px;
    height: auto;
    line-height: 13px;
    margin-right: 6px;
    width: 10px;
  }
`
