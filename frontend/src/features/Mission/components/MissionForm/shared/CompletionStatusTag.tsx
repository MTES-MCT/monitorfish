import { MissionAction } from '@features/Mission/missionAction.types'
import { Icon, Tag, THEME } from '@mtes-mct/monitor-ui'

import FrontCompletionStatus = MissionAction.FrontCompletionStatus
import FrontCompletionStatusLabel = MissionAction.FrontCompletionStatusLabel

type CompletionStatusTagProps = {
  completion: FrontCompletionStatus | undefined
}
export function CompletionStatusTag({ completion }: CompletionStatusTagProps) {
  if (!completion) {
    return null
  }

  switch (completion) {
    case FrontCompletionStatus.COMPLETED:
      return (
        <Tag
          backgroundColor={THEME.color.gainsboro}
          color={THEME.color.mediumSeaGreen}
          Icon={Icon.Confirm}
          iconColor={THEME.color.mediumSeaGreen}
          withCircleIcon
        >
          {FrontCompletionStatusLabel.COMPLETED}
        </Tag>
      )
    case FrontCompletionStatus.UP_TO_DATE:
      return (
        <Tag
          backgroundColor={THEME.color.gainsboro}
          color={THEME.color.mediumSeaGreen}
          Icon={Icon.Confirm}
          iconColor={THEME.color.mediumSeaGreen}
          withCircleIcon
        >
          {FrontCompletionStatusLabel.UP_TO_DATE}
        </Tag>
      )
    case FrontCompletionStatus.TO_COMPLETE_MISSION_ENDED:
      return (
        <Tag
          backgroundColor={THEME.color.gainsboro}
          color={THEME.color.maximumRed}
          Icon={Icon.AttentionFilled}
          iconColor={THEME.color.maximumRed}
          withCircleIcon
        >
          {FrontCompletionStatusLabel.TO_COMPLETE}
        </Tag>
      )

    case FrontCompletionStatus.TO_COMPLETE:
      return (
        <Tag
          backgroundColor={THEME.color.gainsboro}
          color={THEME.color.charcoal}
          Icon={Icon.AttentionFilled}
          iconColor={THEME.color.charcoal}
          withCircleIcon
        >
          {FrontCompletionStatusLabel.TO_COMPLETE}
        </Tag>
      )
    default:
      return null
  }
}
