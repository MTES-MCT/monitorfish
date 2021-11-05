import React, { useMemo } from 'react'
import CustomDatePicker from './CustomDatePicker'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { SquareButton } from '../../commonStyles/Buttons.style'

import { DEFAULT_DATE, DEFAULT_DATE_RANGE } from '../../../domain/entities/regulatory'

/**
 * TODO
 * 1. Quand on passe de non annuel à annuel on doit avoir saisi correctement les dates
 * si on a commencé à saisir => sinon date à moitier correct
 *
 * 2. Lors de l'enregistrement des dates sans années, il faut vérifier qu'elles soient valides
 * (jours entre 1 et 31 et mois entre 1 et 12) -> est-ce qu'il y aurait une méthode pour ça ?
 */
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

  const getDate = date => {
    const { day, month, year } = date
    if (day !== '' && month !== '') {
      return new Date(year, month - 1, day)
    }
    return undefined
  }

  const memoizedStartDateAsDateType = useMemo(() => startDate ? getDate(startDate) : undefined)
  const memoizedEndDateAsDateType = useMemo(() => endDate ? getDate(endDate) : undefined)

  const setDateRange = (key, value) => {
    const newDateRange = {
      ...dateRange,
      [key]: value
    }
    updateList(id, newDateRange)
  }

  const setStartDateWhithoutYear = (key, value) => setDateRange('startDate', { ...startDate || DEFAULT_DATE, [key]: value })
  const setEndDateWhithoutYear = (key, value) => setDateRange('endDate', { ...endDate || DEFAULT_DATE, [key]: value })

  const dateAsObject = value => {
    return {
      day: value.getDate(),
      month: value.getMonth() + 1,
      year: value.getFullYear()
    }
  }
  const setStartDateFromDateType = value => setDateRange('startDate', dateAsObject(value))
  const setEndDateFromDateType = value => setDateRange('endDate', dateAsObject(value))

  return <Wrapper disabled={disabled}>{annualRecurrence
    ? <DateRangeRow>
        Du <CustomDatePicker
          value={memoizedStartDateAsDateType}
          onChange={setStartDateFromDateType}
          onOk={setStartDateFromDateType}
          format='MM/DD/YYYY'
          placement={'rightStart'}
          style={{ margin: '0px 5px' }}
          disabled={disabled}
        />
        au <CustomDatePicker
          value={memoizedEndDateAsDateType}
          onChange={setEndDateFromDateType}
          onOk={setEndDateFromDateType}
          format='DD/MM/YYYY'
          placement={'rightStart'}
          style={{ margin: '0px 5px' }}
          disabled={disabled}
        />
      </ DateRangeRow>
    : <DateRangeRow>
      Du <MonthDateInputSlot
          // $isrequired={startDateIsRequired}
        >
          <MonthDateInput
            value={startDate?.day || undefined}
            onChange={(e) => setStartDateWhithoutYear('day', e.target.value)}
          />
          /<MonthDateInput
            value={startDate?.month || undefined}
            onChange={(e) => setStartDateWhithoutYear('month', e.target.value) }
          />
        </MonthDateInputSlot>
      au <MonthDateInputSlot
            // $isrequired={endDateIsRequired}
          >
          <MonthDateInput
            value={endDate?.day || undefined}
            onChange={(e) => setEndDateWhithoutYear('day', e.target.value) }
          />
          /<MonthDateInput
            value={endDate?.month || undefined}
            onChange={(e) => setEndDateWhithoutYear('month', e.target.value) }
          />
        </MonthDateInputSlot>
    </DateRangeRow>
    }
    <SquareButton disabled={dateRange === DEFAULT_DATE_RANGE} type='delete' onClick={() => removeDateRange(id)} />
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
