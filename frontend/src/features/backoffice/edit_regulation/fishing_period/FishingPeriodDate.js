import React, { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { FISHING_PERIOD_KEYS } from '../../../../domain/entities/regulatory'
import useUpdateArrayInFishingPeriod from '../../../../hooks/fishingPeriod/useUpdateArrayInFishingPeriod'
import CustomDatePicker from '../custom_form/CustomDatePicker'

function FishingPeriodDate({ date, disabled, id }) {
  const { dates } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const updateDates = useUpdateArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATES, dates)
  const onDateChange = useCallback(_date => updateDates(id, _date), [id, updateDates])

  useEffect(() => {
    if (disabled) {
      onDateChange(undefined)
    }
  }, [disabled])

  return (
    <DateRow key={date} $isLast={id === dates.length - 1}>
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

const DateRow = styled.div`
  display: flex;
  ${props => (props.$isLast ? '' : 'margin-bottom: 5px;')}
`

export default FishingPeriodDate
