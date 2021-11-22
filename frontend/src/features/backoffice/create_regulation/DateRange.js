import React from 'react'
import CustomDatePicker from './CustomDatePicker'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { SquareButton } from '../../commonStyles/Buttons.style'

const DateRange = (props) => {
  const {
    id,
    /** @type {DateRange} */
    dateRange,
    updateList,
    removeDateRange,
    disabled
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

  return <Wrapper disabled={disabled}>
    <DateRangeRow>
        Du <CustomDatePicker
          value={startDate}
          onChange={setStartDateFromDateType}
          onOk={setStartDateFromDateType}
          format='DD/MM/YYYY'
          placement={'rightStart'}
          style={{ margin: '0px 5px' }}
          disabled={disabled}
        />
        au <CustomDatePicker
          value={endDate}
          onChange={setEndDateFromDateType}
          onOk={setEndDateFromDateType}
          format='DD/MM/YYYY'
          placement={'rightStart'}
          style={{ margin: '0px 5px' }}
          disabled={disabled}
        />
    </DateRangeRow>
    <SquareButton
      disabled={dateRange?.startDate === undefined && dateRange?.endDate === undefined}
      type='delete'
      onClick={_ => (dateRange?.startDate !== undefined || dateRange?.endDate !== undefined) && removeDateRange(id)} />
    </Wrapper>
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  color: ${COLORS.slateGray};
  opacity: ${props => props.disabled ? '0.4' : '1'};
`

const DateRangeRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

export default DateRange
