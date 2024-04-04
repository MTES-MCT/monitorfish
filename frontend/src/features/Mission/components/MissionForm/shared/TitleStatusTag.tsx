import { Mission } from '@features/Mission/mission.types'
import { Tag, THEME, Accent, Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import MissionStatus = Mission.MissionStatus

type TitleStatusTagProps = Readonly<{
  status: MissionStatus | undefined
}>
export function TitleStatusTag({ status }: TitleStatusTagProps) {
  switch (status) {
    case Mission.MissionStatus.UPCOMING:
      return (
        <MissionStatusTag accent={Accent.PRIMARY} Icon={Icon.Clock} iconColor={THEME.color.blueNcs}>
          {Mission.MissionStatusLabel.UPCOMING}
        </MissionStatusTag>
      )
    case Mission.MissionStatus.IN_PROGRESS:
      return (
        <MissionStatusTag
          accent={Accent.PRIMARY}
          color={THEME.color.charcoal}
          Icon={Icon.Clock}
          iconColor={THEME.color.blueGray}
        >
          {Mission.MissionStatusLabel.IN_PROGRESS}
        </MissionStatusTag>
      )
    // TODO: remove this line when the CLOSED status is removed
    case Mission.MissionStatus.CLOSED:
      return (
        <MissionStatusTag accent={Accent.PRIMARY} Icon={Icon.Confirm} iconColor={THEME.color.charcoal}>
          {Mission.MissionStatusLabel.CLOSED}
        </MissionStatusTag>
      )
    case Mission.MissionStatus.DONE:
      return (
        <MissionStatusTag accent={Accent.PRIMARY} Icon={Icon.Confirm} iconColor={THEME.color.charcoal}>
          {Mission.MissionStatusLabel.DONE}
        </MissionStatusTag>
      )

    default:
      return null
  }
}

const MissionStatusTag = styled(Tag)`
  align-self: end;
  padding: 1px 8px 3px 3px;
`
