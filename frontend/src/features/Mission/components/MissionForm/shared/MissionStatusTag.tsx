import { Mission } from '@features/Mission/mission.types'
import { Accent, Icon, Tag, THEME } from '@mtes-mct/monitor-ui'

import MissionStatus = Mission.MissionStatus

type MissionStatusTagProps = Readonly<{
  status: MissionStatus | undefined
}>
export function MissionStatusTag({ status }: MissionStatusTagProps) {
  switch (status) {
    case Mission.MissionStatus.UPCOMING:
      return (
        <Tag accent={Accent.PRIMARY} Icon={Icon.Clock} iconColor={THEME.color.mayaBlue} withCircleIcon>
          {Mission.MissionStatusLabel.UPCOMING}
        </Tag>
      )
    case Mission.MissionStatus.IN_PROGRESS:
      return (
        <Tag
          accent={Accent.PRIMARY}
          color={THEME.color.charcoal}
          Icon={Icon.Clock}
          iconColor={THEME.color.blueGray}
          withCircleIcon
        >
          {Mission.MissionStatusLabel.IN_PROGRESS}
        </Tag>
      )
    case Mission.MissionStatus.DONE:
      return (
        <Tag accent={Accent.PRIMARY} Icon={Icon.Confirm} iconColor={THEME.color.charcoal} withCircleIcon>
          {Mission.MissionStatusLabel.DONE}
        </Tag>
      )

    default:
      return null
  }
}
