import React, { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { FISHING_PERIOD_KEYS, WEEKDAYS } from '../../../Regulation/utils'
import useSetFishingPeriod from '../../../../hooks/fishingPeriod/useSetFishingPeriod'

const DayPicker = ({ disabled }) => {
  const { weekdays } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const setWeekdays = useSetFishingPeriod(FISHING_PERIOD_KEYS.WEEKDAYS)

  useEffect(() => {
    if (disabled) {
      setWeekdays([])
    }
  }, [disabled])

  const onClick = useCallback(e => {
    let newSelectedList
    const value = e.currentTarget.getAttribute('value')
    if (weekdays?.includes(value)) {
      newSelectedList = weekdays.filter(elem => elem !== value)
    } else {
      newSelectedList = [
        ...weekdays,
        value
      ]
    }
    setWeekdays(newSelectedList)
  }, [weekdays, setWeekdays])

  return <>
    {
      Object.keys(WEEKDAYS).map(weekday => {
        return <Circle
          key={weekday}
          disabled={disabled}
          value={weekday}
          $isGray={weekdays?.includes(weekday)}
          onClick={onClick}>
            {WEEKDAYS[weekday]}
          </Circle>
      })
    }
  </>
}

const Circle = styled.a`
  display: inline-block;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  font-size: 13px;
  border: 1px solid ${COLORS.lightGray};
  margin-right: 5px;
  text-align: center;
  line-height: 2em;
  color: ${p => p.$isGray ? p.theme.color.gunMetal : p.theme.color.lightGray};
  ${p => p.$isGray ? `background-color: ${COLORS.gainsboro}` : ''};
  text-decoration: none;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.disabled ? '0.4' : '1'};
  &:hover {
    text-decoration: none;
    color: ${COLORS.slateGray};
  }
`

export default DayPicker
