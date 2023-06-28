import { Icon, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { Mission } from '../../../../domain/entities/mission/types'
import { getMissionColor } from '../../layers/Mission/MissionLayer/styles'

type MissionStatusLabelType = {
  missionStatus?: Mission.MissionStatus | undefined
}
export function MissionStatusLabel({ missionStatus }: MissionStatusLabelType) {
  switch (missionStatus) {
    case Mission.MissionStatus.UPCOMING:
      return (
        <StatusWrapper color={getMissionColor(Mission.MissionStatus.UPCOMING, true)}>
          <InProgressIcon />
          {Mission.MissionStatusLabel.UPCOMING}
        </StatusWrapper>
      )
    case Mission.MissionStatus.IN_PROGRESS:
      return (
        <StatusWrapper color={getMissionColor(Mission.MissionStatus.IN_PROGRESS, true)}>
          <InProgressIcon />
          {Mission.MissionStatusLabel.IN_PROGRESS}
        </StatusWrapper>
      )
    case Mission.MissionStatus.CLOSED:
      return (
        <StatusWrapper color={getMissionColor(Mission.MissionStatus.CLOSED, true)}>
          <Icon.Check />
          {Mission.MissionStatusLabel.CLOSED}
        </StatusWrapper>
      )
    case Mission.MissionStatus.DONE:
      return (
        <StatusWrapper color={getMissionColor(Mission.MissionStatus.DONE, true)}>
          <Icon.Check />
          {Mission.MissionStatusLabel.DONE}
        </StatusWrapper>
      )

    default:
      return <StatusWrapper color={THEME.color.opal}>Aucun statut</StatusWrapper>
  }
}

const InProgressIcon = styled.span`
  height: 8px;
  width: 8px;
  margin-right: 5px;
  background-color: #33a02c;
  border-radius: 50%;
  display: inline-block;
`

const StatusWrapper = styled.div<{ color: string }>`
  color: ${p => p.color};
  font-weight: 500;
  display: flex;
  align-items: center;

  svg {
    margin-right: 6px;
  }
`
