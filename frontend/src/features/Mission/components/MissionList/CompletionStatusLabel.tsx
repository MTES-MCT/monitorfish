import { MissionAction } from '@features/Mission/missionAction.types'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import FrontCompletionStatus = MissionAction.FrontCompletionStatus
import FrontCompletionStatusLabel = MissionAction.FrontCompletionStatusLabel

export function CompletionStatusLabel({ completion }: { completion: FrontCompletionStatus | undefined }) {
  if (!completion) {
    return <>-</>
  }

  switch (completion) {
    case FrontCompletionStatus.COMPLETED:
      return (
        <CompletionStatusContainer>
          <Icon.Confirm color={THEME.color.mediumSeaGreen} />
          <Text $color={THEME.color.mediumSeaGreen}>{FrontCompletionStatusLabel.COMPLETED}</Text>
        </CompletionStatusContainer>
      )
    case FrontCompletionStatus.UP_TO_DATE:
      return (
        <CompletionStatusContainer>
          <Icon.Confirm color={THEME.color.mediumSeaGreen} />
          <Text $color={THEME.color.mediumSeaGreen}>{FrontCompletionStatusLabel.UP_TO_DATE}</Text>
        </CompletionStatusContainer>
      )
    case FrontCompletionStatus.TO_COMPLETE_MISSION_ENDED:
      return (
        <CompletionStatusContainer>
          <Icon.AttentionFilled color={THEME.color.maximumRed} />
          <Text $color={THEME.color.maximumRed}>{FrontCompletionStatusLabel.TO_COMPLETE}</Text>
        </CompletionStatusContainer>
      )

    case FrontCompletionStatus.TO_COMPLETE:
      return (
        <CompletionStatusContainer>
          <Icon.AttentionFilled color={THEME.color.charcoal} />
          <Text $color={THEME.color.charcoal}>{FrontCompletionStatusLabel.TO_COMPLETE}</Text>
        </CompletionStatusContainer>
      )
    default:
      return null
  }
}

const CompletionStatusContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`

const Text = styled.span<{ $color: string }>`
  color: ${p => p.$color};
`
