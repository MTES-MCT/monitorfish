import { useIsMissionEnded } from '@features/Mission/components/MissionForm/hooks/useIsMissionEnded'
import { getMissionActionMissingFields } from '@features/Mission/components/MissionForm/utils/getMissionActionMissingFields'
import { Icon, pluralize, THEME } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

export function MissingFieldsText() {
  const { values } = useFormikContext<MissionActionFormValues>()
  const missingFields = getMissionActionMissingFields(values)
  const isMissionEnded = useIsMissionEnded()

  if (missingFields === 0) {
    return (
      <CompletionStatus data-cy="action-completion-status" isCompleted>
        <Icon.Confirm color={THEME.color.mediumSeaGreen} size={20} />
        Les champs nécessaires aux statistiques sont complétés.
      </CompletionStatus>
    )
  }

  return (
    <CompletionStatus data-cy="action-completion-status">
      <Icon.AttentionFilled color={isMissionEnded ? THEME.color.maximumRed : THEME.color.charcoal} />
      <Text $color={isMissionEnded ? THEME.color.maximumRed : THEME.color.charcoal}>
        {missingFields} {pluralize('champ', missingFields)} {pluralize('nécessaire', missingFields)} aux statistiques à
        compléter
      </Text>
    </CompletionStatus>
  )
}

const Text = styled.p<{ $color: string }>`
  color: ${p => p.$color};
`

const CompletionStatus = styled.div<{
  isCompleted?: boolean
}>`
  display: flex;
  margin-top: 6px;
  font-weight: 700;
  color: ${p => (p.isCompleted ? THEME.color.mediumSeaGreen : THEME.color.gunMetal)};

  span {
    margin-right: 6px;
    margin-left: 2px;
  }

  div {
    vertical-align: top;
    margin-right: 4px;
  }
`
