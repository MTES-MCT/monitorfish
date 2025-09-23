import { useIsMissionEnded } from '@features/Mission/components/MissionForm/hooks/useIsMissionEnded'
import { getMissionActionMissingFields } from '@features/Mission/components/MissionForm/utils/getMissionActionMissingFields'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { MissionActionForTimeline } from '@features/Mission/components/MissionForm/types'

type MissingFieldsText = {
  missionAction: MissionActionForTimeline
}
export function CompletionStatusIcon({ missionAction }: MissingFieldsText) {
  const dispatch = useMainAppDispatch()
  const missingFields = getMissionActionMissingFields(missionAction, dispatch)
  const isMissionEnded = useIsMissionEnded()

  if (missingFields === 0) {
    return (
      <Wrapper>
        <Icon.Confirm color={THEME.color.mediumSeaGreen} data-cy="action-all-fields-completed" size={20} />
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Icon.AttentionFilled
        color={isMissionEnded ? THEME.color.maximumRed : THEME.color.charcoal}
        data-cy="action-contains-missing-fields"
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin-top: 4px;
  margin-left: 12px;
`
