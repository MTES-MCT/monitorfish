import { regulationActions } from '@features/Regulation/slice'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import styled from 'styled-components'

import { FishingPeriodKey, WEEKDAYS } from '../../../../utils'

type DayPickerProps = Readonly<{
  disabled: boolean
}>
export function DayPicker({ disabled }: DayPickerProps) {
  const dispatch = useBackofficeAppDispatch()
  const fishingPeriod = useBackofficeAppSelector(state => state.regulation.processingRegulation.fishingPeriod)

  const toggle = (weekdayKey: string) => {
    let newSelectedList: string[]

    if (fishingPeriod?.weekdays?.includes(weekdayKey)) {
      newSelectedList = fishingPeriod?.weekdays.filter(elem => elem !== weekdayKey)
    } else {
      newSelectedList = [...(fishingPeriod?.weekdays ?? []), weekdayKey]
    }

    dispatch(regulationActions.setFishingPeriod({ key: FishingPeriodKey.WEEKDAYS, value: newSelectedList }))
  }

  return (
    <>
      {Object.keys(WEEKDAYS).map(weekdayKey => (
        <Circle
          key={weekdayKey}
          $disabled={disabled}
          $isGray={fishingPeriod?.weekdays?.includes(weekdayKey)}
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
  height: 27px;
  width: 27px;
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
    color: #FF3392;
  }
`
