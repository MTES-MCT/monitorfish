import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { useUpdateArrayInFishingPeriod } from '../../../../hooks/fishingPeriod/useUpdateArrayInFishingPeriod'
import { FISHING_PERIOD_KEYS } from '../../../Regulation/utils'
import { CustomDatePicker } from '../custom_form/CustomDatePicker'

type FishingPeriodDateProps = Readonly<{
  date: string | undefined
  disabled: boolean
  id: number
}>
export function FishingPeriodDate({ date, disabled, id }: FishingPeriodDateProps) {
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)
  const updateDates = useUpdateArrayInFishingPeriod(
    FISHING_PERIOD_KEYS.DATES,
    processingRegulation.fishingPeriod?.dates
  )
  const onDateChange = useCallback(_date => updateDates(id, _date), [id, updateDates])

  useEffect(() => {
    if (disabled) {
      onDateChange(undefined)
    }
  }, [disabled, onDateChange])

  return (
    <DateRow
      key={date}
      $isLast={!!processingRegulation.fishingPeriod && id === processingRegulation.fishingPeriod.dates.length - 1}
    >
      <CustomDatePicker
        disabled={disabled}
        format="dd/MM/yyyy"
        oneTap
        placement="rightStart"
        saveValue={onDateChange}
        value={date}
      />
    </DateRow>
  )
}

const DateRow = styled.div<{
  $isLast: boolean
}>`
  display: flex;
  ${p => (p.$isLast ? '' : 'margin-bottom: 5px;')}
`
