import { Mission } from '@features/Mission/mission.types'
import { Tag, THEME, Accent, Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import MissionStatus = Mission.MissionStatus

type MissionStatusTagProps = Readonly<{
  status: MissionStatus | undefined
}>
export function MissionStatusTag({ status }: MissionStatusTagProps) {
  switch (status) {
    case Mission.MissionStatus.UPCOMING:
      return (
        <StyledTag accent={Accent.PRIMARY} Icon={Icon.Clock} iconColor={THEME.color.blueNcs}>
          {Mission.MissionStatusLabel.UPCOMING}
        </StyledTag>
      )
    case Mission.MissionStatus.IN_PROGRESS:
      return (
        <StyledTag
          accent={Accent.PRIMARY}
          color={THEME.color.charcoal}
          Icon={Icon.Clock}
          iconColor={THEME.color.blueGray}
        >
          {Mission.MissionStatusLabel.IN_PROGRESS}
        </StyledTag>
      )
    // TODO: remove this line when the CLOSED status is removed
    case Mission.MissionStatus.CLOSED:
      return (
        <StyledTag accent={Accent.PRIMARY} Icon={Icon.Confirm} iconColor={THEME.color.charcoal}>
          {Mission.MissionStatusLabel.CLOSED}
        </StyledTag>
      )
    case Mission.MissionStatus.DONE:
      return (
        <StyledTag accent={Accent.PRIMARY} Icon={Icon.Confirm} iconColor={THEME.color.charcoal}>
          {Mission.MissionStatusLabel.DONE}
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
