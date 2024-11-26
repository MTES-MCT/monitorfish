import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { useSetFishingPeriod } from '../../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { FishingPeriodKey, WEEKDAYS } from '../../../utils'

type DayPickerProps = Readonly<{
  disabled: boolean
}>
export function DayPicker({ disabled }: DayPickerProps) {
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)
  const setWeekdays = useSetFishingPeriod(FishingPeriodKey.WEEKDAYS)

  useEffect(() => {
    if (disabled) {
      setWeekdays([])
    }
  }, [disabled, setWeekdays])

  const onClick = useCallback(
    e => {
      let newSelectedList
      const value = e.currentTarget.getAttribute('value')
      if (processingRegulation.fishingPeriod?.weekdays?.includes(value)) {
        newSelectedList = processingRegulation.fishingPeriod?.weekdays.filter(elem => elem !== value)
      } else {
        newSelectedList = [...(processingRegulation.fishingPeriod?.weekdays ?? []), value]
      }
      setWeekdays(newSelectedList)
    },
    [processingRegulation.fishingPeriod?.weekdays, setWeekdays]
  )

  return (
    <>
      {Object.keys(WEEKDAYS).map(weekday => (
        <Circle
          key={weekday}
          $disabled={disabled}
          $isGray={!!processingRegulation.fishingPeriod?.weekdays?.includes(weekday)}
          onClick={onClick}
        >
          {WEEKDAYS[weekday]}
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
