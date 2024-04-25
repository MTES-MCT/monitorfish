import { Mission } from '@features/Mission/mission.types'
import { getMissionColor } from '@features/Mission/utils'
import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type MissionStatusLabelProps = {
  status: Mission.MissionStatus
}
export function MissionStatusLabel({ status }: MissionStatusLabelProps) {
  const color = getMissionColor(status)

  switch (status) {
    case Mission.MissionStatus.IN_PROGRESS:
      return (
        <StatusWrapper color={color}>
          <Icon.Clock color={color} />
          {Mission.MissionStatusLabel.IN_PROGRESS}
        </StatusWrapper>
      )
    case Mission.MissionStatus.DONE:
      return (
        <StatusWrapper color={color}>
          <Icon.Confirm color={color} />
          {Mission.MissionStatusLabel.DONE}
        </StatusWrapper>
      )
    case Mission.MissionStatus.UPCOMING:
      return (
        <StatusWrapper color={color}>
          <Icon.ClockDashed color={color} />
          {Mission.MissionStatusLabel.UPCOMING}
        </StatusWrapper>
      )

    default:
      return <StatusWrapper color={getMissionColor(Mission.MissionStatus.DONE)}>Aucun statut</StatusWrapper>
  }
}
const StatusWrapper = styled.div<{ color: string; smallMargin?: boolean }>`
  color: ${p => p.color};
  font-weight: 500;
  display: flex;
  align-items: center;
  svg {
    margin-right: 6px;
  }
`
