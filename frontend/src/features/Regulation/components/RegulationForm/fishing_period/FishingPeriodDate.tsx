import { FishingPeriodKey } from '@features/Regulation/utils'
import { useUpdateArrayInFishingPeriod } from '@hooks/fishingPeriod/useUpdateArrayInFishingPeriod'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { CustomDatePicker } from '../custom_form/CustomDatePicker'

type FishingPeriodDateProps = Readonly<{
  date: Date | undefined
  disabled: boolean
  id: number
}>
export function FishingPeriodDate({ date, disabled, id }: FishingPeriodDateProps) {
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)
  // TODO Simplify this unnecessarily complex pattern: a callback "maker" result called withing another callback.
  const updateDates = useUpdateArrayInFishingPeriod(FishingPeriodKey.DATES, processingRegulation.fishingPeriod?.dates)
  const onDateChange = useCallback((nextDate: Date | undefined) => updateDates(id, nextDate), [id, updateDates])

  useEffect(() => {
    if (disabled) {
      onDateChange(undefined)
    }
  }, [disabled, onDateChange])

  return (
    <DateRow
      key={String(date)}
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
