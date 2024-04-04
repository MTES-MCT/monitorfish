import { useGetMissionActionMissingFields } from '@features/Mission/components/MissionForm/hooks/useGetMissionActionMissingFields'
import { ExclamationPoint, Icon, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { MissionActionForTimeline } from '@features/Mission/components/MissionForm/types'

type MissingFieldsText = {
  missionAction: MissionActionForTimeline
}
export function CompletionStatusIcon({ missionAction }: MissingFieldsText) {
  const { isMissionEnded, missingFields } = useGetMissionActionMissingFields(missionAction)

  if (missingFields === 0) {
    return (
      <Wrapper>
        <Icon.Confirm color={THEME.color.mediumSeaGreen} size={20} />
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <ExclamationPoint
        backgroundColor={isMissionEnded ? THEME.color.maximumRed : THEME.color.charcoal}
        color={THEME.color.white}
        size={17}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin-top: 4px;
  margin-left: 12px;
`
