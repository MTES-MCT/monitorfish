import { Tag } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { getMissionSourceTagBackgroundColor, getMissionSourceTagText } from '../../../../domain/entities/mission'
import { Mission } from '../../../../domain/entities/mission/types'

type TitleSourceTagProps = {
  missionId: number | undefined
  missionSource: Mission.MissionSource | undefined
}
export function TitleSourceTag({ missionId, missionSource }: TitleSourceTagProps) {
  if (!missionSource || !missionId) {
    return <></>
  }

  return <MissionSourceTag missionSource={missionSource}>{getMissionSourceTagText(missionSource)}</MissionSourceTag>
}

export const MissionSourceTag = styled(Tag)<{
  missionSource: Mission.MissionSource | undefined
}>`
  background: ${p => getMissionSourceTagBackgroundColor(p.missionSource)};
  color: ${p => (p.missionSource === Mission.MissionSource.RAPPORTNAV ? p.theme.color.charcoal : p.theme.color.white)};
  margin-left: 24px;
  vertical-align: middle;
`
