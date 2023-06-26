import { Tag, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { Mission } from '../../../../domain/entities/mission/types'

import MissionStatus = Mission.MissionStatus

type TitleStatusTagProps = {
  status: MissionStatus | undefined
}
export function TitleStatusTag({ status }: TitleStatusTagProps) {
  switch (status) {
    case Mission.MissionStatus.UPCOMING:
      return (
        <MissionStatusTag background={THEME.color.yellowGreen} color={THEME.color.white}>
          {Mission.MissionStatusLabel.UPCOMING}
        </MissionStatusTag>
      )
    case Mission.MissionStatus.IN_PROGRESS:
      return (
        <MissionStatusTag background={THEME.color.mediumSeaGreen} color={THEME.color.white}>
          {Mission.MissionStatusLabel.IN_PROGRESS}
        </MissionStatusTag>
      )
    case Mission.MissionStatus.CLOSED:
      return (
        <MissionStatusTag
          background={THEME.color.white}
          borderColor={THEME.color.slateGray}
          color={THEME.color.slateGray}
        >
          {Mission.MissionStatusLabel.CLOSED}
        </MissionStatusTag>
      )
    case Mission.MissionStatus.DONE:
      return (
        <MissionStatusTag background={THEME.color.charcoal} color={THEME.color.white}>
          {Mission.MissionStatusLabel.DONE}
        </MissionStatusTag>
      )

    default:
      return ''
  }
}

const MissionStatusTag = styled(Tag)<{
  background: string
  borderColor?: string | undefined
  color: string
}>`
  background: ${p => p.background};
  color: ${p => p.color};
  border: ${p => (p.borderColor ? `1px solid ${p.borderColor}` : 'unset')};
  margin-left: 16px;
  vertical-align: middle;
`
