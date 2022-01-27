import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import useUpdateArrayInFishingPeriod from '../../../../hooks/useUpdateArrayInFishingPeriod'
import { FISHING_PERIOD_KEYS } from '../../../../domain/entities/regulatory'
import CustomDatePicker from '../custom_form/CustomDatePicker'

const FishingPeriodDate = ({ date, id, disabled }) => {
  const { dates } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const updateDates = useUpdateArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATES, dates)
  const onDateChange = useCallback(_date => updateDates(id, _date), [id, updateDates])

  return <DateRow key={date} $isLast={id === dates.length - 1}>
    <CustomDatePicker
      disabled={disabled}
      value={date}
      saveValue={onDateChange}
      format='DD/MM/YYYY'
      placement={'rightStart'}
      oneTap
    />
  </DateRow>
}

const DateRow = styled.div`
  display: flex;
  ${props => props.$isLast ? '' : 'margin-bottom: 5px;'}
`

export default FishingPeriodDate
