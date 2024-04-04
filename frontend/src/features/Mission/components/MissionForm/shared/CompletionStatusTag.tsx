import { useGetMissionCompletion } from '@features/Mission/components/MissionForm/hooks/useGetMissionCompletion'
import { MissionAction } from '@features/Mission/missionAction.types'
import { ExclamationPoint, Icon, Tag, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import FrontCompletionStatus = MissionAction.FrontCompletionStatus

export function CompletionStatusTag() {
  const completion = useGetMissionCompletion()
  if (!completion) {
    return null
  }

  switch (completion) {
    case FrontCompletionStatus.COMPLETED:
      return (
        <StyledTag
          backgroundColor={THEME.color.gainsboro}
          color={THEME.color.mediumSeaGreen}
          Icon={Icon.Confirm}
          iconColor={THEME.color.mediumSeaGreen}
        >
          Complétée
        </StyledTag>
      )
    case FrontCompletionStatus.UP_TO_DATE:
      return (
        <StyledTag
          backgroundColor={THEME.color.gainsboro}
          color={THEME.color.mediumSeaGreen}
          Icon={Icon.Confirm}
          iconColor={THEME.color.mediumSeaGreen}
        >
          À jour
        </StyledTag>
      )
    case FrontCompletionStatus.TO_COMPLETE_MISSION_ENDED:
      return (
        <StyledTag backgroundColor={THEME.color.gainsboro} color={THEME.color.maximumRed}>
          <ExclamationPoint backgroundColor={THEME.color.maximumRed} color={THEME.color.white} size={15} />À compléter
        </StyledTag>
      )

    case FrontCompletionStatus.TO_COMPLETE:
      return (
        <StyledTag backgroundColor={THEME.color.gainsboro} color={THEME.color.charcoal}>
          <ExclamationPoint backgroundColor={THEME.color.charcoal} color={THEME.color.white} size={15} />À compléter
        </StyledTag>
      )
    default:
      return null
  }
}

const StyledTag = styled(Tag)`
  align-self: end;
  padding: 1px 8px 3px 3px;
`
