import { Label } from '@features/commonStyles/Input.style'
import { regulationActions } from '@features/Regulation/slice'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { MultiRadio } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { FishingPeriodKey } from '../../../../utils'

type FishingPeriodAnnualRecurrenceProps = Readonly<{
  disabled: boolean | undefined
}>
export function FishingPeriodAnnualRecurrence({ disabled = false }: FishingPeriodAnnualRecurrenceProps) {
  const dispatch = useBackofficeAppDispatch()
  const fishingPeriod = useBackofficeAppSelector(state => state.regulation.processingRegulation.fishingPeriod)

  return (
    <Wrapper $disabled={disabled}>
      <Label>Récurrence annuelle</Label>
      <MultiRadio
        disabled={disabled}
        isInline
        isLabelHidden
        label="Périodes"
        name="fishing_period_annual_recurrence"
        onChange={value => {
          dispatch(regulationActions.setFishingPeriod({ key: FishingPeriodKey.ANNUAL_RECURRENCE, value }))
        }}
        options={[
          { label: 'oui', value: true },
          { label: 'non', value: false }
        ]}
        value={fishingPeriod?.annualRecurrence}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $disabled?: boolean
}>`
  display: flex;
  opacity: ${p => (p.$disabled ? '0.4' : '1')};
`
