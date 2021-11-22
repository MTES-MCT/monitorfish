import React from 'react'
import CustomDatePicker from './CustomDatePicker'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { SquareButton } from '../../commonStyles/Buttons.style'

/**
 * @enum {string}
 */
const DATE_KEYS = {
  DAY: 'day',
  MONTH: 'month'
}

const DateRange = (props) => {
  const {
    id,
    annualRecurrence,
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

  const setDateWhithoutYear = (key, value, range) => {
    if (key === DATE_KEYS.MONTH) {
      setDateRange(range, new Date().setMonth(value - 1))
    } else if (key === DATE_KEYS.DAY) {
      setDateRange(range, new Date().setDate(value))
    }
  }

  const setStartDateFromDateType = value => setDateRange('startDate', value)
  const setEndDateFromDateType = value => setDateRange('endDate', value)

  return <Wrapper disabled={disabled}>{annualRecurrence
    ? <DateRangeRow>
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
      </ DateRangeRow>
    : <DateRangeRow>
      Du <MonthDateInputSlot >
          <MonthDateInput
            value={startDate?.getDate() || undefined}
            onChange={(e) => setDateWhithoutYear('startDate', DATE_KEYS.DAY, e.target.value)}
          />
          /<MonthDateInput
            value={startDate?.getMonth() + 1 || undefined}
            onChange={(e) => setDateWhithoutYear('startDate', DATE_KEYS.MONTH, e.target.value) }
          />
        </MonthDateInputSlot>
      au <MonthDateInputSlot >
          <MonthDateInput
            value={endDate?.getDate() || undefined}
            onChange={(e) => setDateWhithoutYear('endDate', DATE_KEYS.DAY, e.target.value) }
          />
          /<MonthDateInput
            value={endDate?.getMonth() + 1 || undefined}
            onChange={(e) => setDateWhithoutYear('endDate', DATE_KEYS.MONTH, e.target.value) }
          />
        </MonthDateInputSlot>
    </DateRangeRow>
    }
    <SquareButton
      disabled={dateRange?.startDate === undefined && dateRange?.endDate === undefined}
      type='delete'
      onClick={_ => dateRange?.startDate !== undefined && dateRange?.endDate !== undefined && removeDateRange(id)} />
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

const MonthDateInput = styled.input`
  border: none!important;
  background: ${COLORS.white}!important;
  -webkit-appearance: none;
  -moz-appearance: textfield;
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
  apparance: none;
  max-width: 20px;
  text-align: right;
  box-sizing: border-box;
  padding: 0px 2px 1px 2px;
  background-color: ${COLORS.white};
  color: ${COLORS.gunMetal}
`

const MonthDateInputSlot = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0px 5px;
  border: 1px solid ${props => props.$isrequired ? COLORS.red : COLORS.lightGray};
  height: 35px;
  width: 50px;
  box-sizing: border-box;
  color: ${COLORS.lightGray}
`

export default DateRange
