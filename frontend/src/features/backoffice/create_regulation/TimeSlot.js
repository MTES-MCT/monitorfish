import React, { useState, useEffect } from 'react'
import CustomDatePicker from './CustomDatePicker'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { SquareButton } from '../../commonStyles/Buttons.style'

const TimeSlot = ({ id, annual, timeSlot, updateList, removeTimeSlot, saveForm }) => {
  const [startDate, setStartDate] = useState(timeSlot?.startDate || '')
  const [endDate, setEndDate] = useState(timeSlot?.endDate || '')
  const [startDateIsRequired, setStartDateIsRequired] = useState(false)
  const [endDateIsRequired, setEndDateIsRequired] = useState(false)

  const requiredValuesAreFilled = () => {
    const startDateIsFilled = startDate && startDate !== ''
    setStartDateIsRequired(!startDateIsFilled)
    const endDateIsFilled = endDate && endDate !== ''
    setEndDateIsRequired(!endDateIsFilled)
    return startDateIsFilled && endDateIsFilled
  }

  useEffect(() => {
    if (timeSlot) {
      setStartDate(timeSlot.startDate || '')
      setEndDate(timeSlot.endDate || '')
      setStartDateIsRequired(false)
      setEndDateIsRequired(false)
    }
  }, [timeSlot])

  useEffect(() => {
    if (saveForm && requiredValuesAreFilled()) {
      updateList(id, { startDate, endDate })
    }
  }, [saveForm])

  return <Wrapper>{annual
    ? <TimeSlotRow>
        Du <CustomDatePicker
          $isrequired={startDateIsRequired}
          value={startDate}
          onChange={(date) => setStartDate(date)}
          onOk={(date, _) => setStartDate(date)}
          format='MM/DD/YYYY'
          placement={'rightStart'}
          style={{ margin: '0px 5px' }}
        />
        au <CustomDatePicker
          $isrequired={endDateIsRequired}
          value={endDate}
          onChange={(date) => setEndDate(date)}
          onOk={(date, _) => setEndDate(date)}
          format='DD/MM/YYYY'
          placement={'rightStart'}
          style={{ margin: '0px 5px' }}
        />
      </ TimeSlotRow>
    : <TimeSlotRow>
      Du <MonthDateInputSlot $isrequired={startDateIsRequired}>
          <MonthDateInput value={new Date(startDate).getDate()} type="number" min="1" max="31" onChange={(e) => setStartDate((new Date(startDate)).setDate(e.target.value)) }/>
          /<MonthDateInput value={new Date(startDate).getMonth()} type="number" min="1" max="12" onChange={(e) => setStartDate((new Date(startDate)).setMonth(e.target.value)) }/>
        </MonthDateInputSlot>
      au <MonthDateInputSlot $isrequired={endDateIsRequired}>
          <MonthDateInput value={new Date(endDate).getDate()} type="number" min="1" max="31" onChange={(e) => setEndDate((new Date(endDate)).setDate(e.target.value)) }/>
          /<MonthDateInput value={new Date(endDate).getMonth()} type="number" min="1" max="12" onChange={(e) => setEndDate((new Date(endDate)).setMonth(e.target.value)) }/>
        </MonthDateInputSlot>
    </TimeSlotRow>
    }
    <SquareButton type='delete' onClick={() => removeTimeSlot(id)} />
    </Wrapper>
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
`

const TimeSlotRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const MonthDateInput = styled.input`
  border: none;
  -webkit-appearance: none;
  -moz-appearance: textfield;
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

export default TimeSlot
