import React from 'react'
import CustomDatePicker from '../custom_form/CustomDatePicker'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'

const DateRange = (props) => {
  const {
    id,
    /** @type {DateRange} */
    dateRange,
    updateList,
    disabled,
    isLast
  } = props

  const {
    /** @type {Date} */
    startDate,
    /** @type {Date} */
    endDate
  } = dateRange

  const setDateRange = (key, value) => {
    const newDateRange = {
      ...dateRange,
      [key]: value
    }
    updateList(id, newDateRange)
  }

  const setStartDateFromDateType = value => {
    setDateRange('startDate', value)
  }
  const setEndDateFromDateType = value => setDateRange('endDate', value)

  return <Wrapper $isLast={isLast} disabled={disabled}>
    <DateRangeRow>
        Du <CustomDatePicker
          value={startDate}
          saveValue={setStartDateFromDateType}
          format='DD/MM/YYYY'
          placement={'rightStart'}
          style={{ margin: '0px 5px' }}
          disabled={disabled}
          oneTap
        />
        au <CustomDatePicker
          value={endDate}
          saveValue={setEndDateFromDateType}
          format='DD/MM/YYYY'
          placement={'rightStart'}
          style={{ margin: '0px 0px 0px 5px' }}
          disabled={disabled}
          oneTap
        />
    </DateRangeRow>
  </Wrapper>
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  color: ${COLORS.slateGray};
  opacity: ${props => props.disabled ? '0.4' : '1'};
  ${props => props.$isLast ? '' : 'margin-bottom: 5px'};
`

const DateRangeRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

export default DateRange
