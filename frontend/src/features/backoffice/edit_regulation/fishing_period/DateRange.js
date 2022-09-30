/* eslint-disable react/forbid-component-props */
import React, { useCallback } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import CustomDatePicker from '../custom_form/CustomDatePicker'

function DateRange(props) {
  const {
    dateRange,
    /** @type {DateRange} */
    disabled,
    id,
    isLast,
    updateList
  } = props

  const {
    /** @type {Date} */
    endDate,
    /** @type {Date} */
    startDate
  } = dateRange

  const setDateRange = useCallback(
    key => value => {
      const newDateRange = {
        ...dateRange,
        [key]: value
      }
      updateList(id, newDateRange)
    },
    [dateRange, id, updateList]
  )

  const setEndDate = setDateRange('endDate')
  const setStartDate = setDateRange('startDate')

  return (
    <Wrapper $isLast={isLast} disabled={disabled}>
      <DateRangeRow>
        Du{' '}
        <CustomDatePicker
          disabled={disabled}
          format="dd/MM/yyyy"
          oneTap
          placement="rightStart"
          saveValue={setStartDate}
          style={{ margin: '0px 5px' }}
          value={startDate}
        />
        au{' '}
        <CustomDatePicker
          disabled={disabled}
          format="dd/MM/yyyy"
          oneTap
          placement="rightStart"
          saveValue={setEndDate}
          style={{ margin: '0px 0px 0px 5px' }}
          value={endDate}
        />
      </DateRangeRow>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  color: ${COLORS.slateGray};
  opacity: ${props => (props.disabled ? '0.4' : '1')};
  ${props => (props.$isLast ? '' : 'margin-bottom: 5px')};
`

const DateRangeRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

export default DateRange
