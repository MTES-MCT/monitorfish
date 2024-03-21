import { Mission } from '@features/Mission/mission.types'
import { Tag } from '@mtes-mct/monitor-ui'
import { getMissionSourceTagText } from 'domain/entities/mission'
import styled from 'styled-components'

type TitleSourceTagProps = Readonly<{
  missionId: number | undefined
  missionSource: Mission.MissionSource | undefined
}>
export function TitleSourceTag({ missionId, missionSource }: TitleSourceTagProps) {
  if (!missionSource || !missionId) {
    return <></>
  }

  return (
    <MissionSourceTag
      isFromCacem={
        missionSource === Mission.MissionSource.POSEIDON_CACEM || missionSource === Mission.MissionSource.MONITORENV
      }
    >
      {getMissionSourceTagText(missionSource)}
    </MissionSourceTag>
  )
}

export const MissionSourceTag = styled(Tag)<{
  isFromCacem: boolean
}>`
  background: ${p => (p.isFromCacem ? p.theme.color.mediumSeaGreen : p.theme.color.blueGray)};
  color: ${p => p.theme.color.white};
  margin-left: 24px;
  vertical-align: middle;
`
