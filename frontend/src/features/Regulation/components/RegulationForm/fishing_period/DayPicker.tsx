import { useSetFishingPeriod } from '@hooks/fishingPeriod/useSetFishingPeriod'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { FishingPeriodKey, WEEKDAYS } from '../../../utils'

type DayPickerProps = Readonly<{
  disabled: boolean
}>
export function DayPicker({ disabled }: DayPickerProps) {
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)
  const setWeekdays = useSetFishingPeriod(FishingPeriodKey.WEEKDAYS)

  const toggle = useCallback(
    (weekdayKey: string) => {
      let newSelectedList: string[]

      if (processingRegulation.fishingPeriod?.weekdays?.includes(weekdayKey)) {
        newSelectedList = processingRegulation.fishingPeriod?.weekdays.filter(elem => elem !== weekdayKey)
      } else {
        newSelectedList = [...(processingRegulation.fishingPeriod?.weekdays ?? []), weekdayKey]
      }
      setWeekdays(newSelectedList)
    },
    [processingRegulation.fishingPeriod?.weekdays, setWeekdays]
  )

  useEffect(() => {
    if (disabled) {
      setWeekdays([])
    }
  }, [disabled, setWeekdays])

  return (
    <>
      {Object.keys(WEEKDAYS).map(weekdayKey => (
        <Circle
          key={weekdayKey}
          $disabled={disabled}
          $isGray={processingRegulation.fishingPeriod.weekdays.includes(weekdayKey)}
          data-cy={`weekday-${weekdayKey}`}
          onClick={() => toggle(weekdayKey)}
        >
          {WEEKDAYS[weekdayKey]}
        </Circle>
      ))}
    </>
  )
}

const Circle = styled.a<{
  $disabled: boolean
  $isGray: boolean
}>`
  display: inline-block;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  font-size: 13px;
  border: 1px solid ${p => p.theme.color.lightGray};
  margin-right: 5px;
  text-align: center;
  line-height: 2em;
  color: ${p => (p.$isGray ? p.theme.color.gunMetal : p.theme.color.lightGray)};
  ${p => (p.$isGray ? `background-color: ${p.theme.color.gainsboro}` : '')};
  text-decoration: none;
  cursor: ${p => (p.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${p => (p.$disabled ? '0.4' : '1')};
  &:hover {
    text-decoration: none;
    color: ${p => p.theme.color.slateGray};
  }
`
