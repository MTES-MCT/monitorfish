import React from 'react'
import CustomDatePicker from './CustomDatePicker'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'

const TimeSlot = ({ annual }) => {
  return (annual
    ? <TimeSlotRow>
        Du <CustomDatePicker
          /* $isrequired={startDateIsRequired}
          value={currentStartDate}
          onChange={(date) => setCurrentStartDate(date)}
          onOk={(date, _) => setCurrentStartDate(date)} */
          format='MM/DD/YYYY'
          placement={'rightStart'}
          style={{ margin: '0px 5px' }}
        />
        au <CustomDatePicker
          /* $isrequired={startDateIsRequired}
          value={currentStartDate}
          onChange={(date) => setCurrentStartDate(date)}
          onOk={(date, _) => setCurrentStartDate(date)} */
          format='DD/MM/YYYY'
          placement={'rightStart'}
          style={{ margin: '0px 5px' }}
        />
      </ TimeSlotRow>
    : <TimeSlotRow>
      Du <MonthDateInputSlot><MonthDateInput type="number" min="1" max="31" />/<MonthDateInput type="number" min="1" max="12" /> </MonthDateInputSlot>
      au <MonthDateInputSlot><MonthDateInput type="number" min="1" max="31" />/<MonthDateInput type="number" min="1" max="12" /> </MonthDateInputSlot>
    </TimeSlotRow>)
}

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
  max-width: 21px;
  text-align: right;
  box-sizing: border-box;
  padding: 0px 4px 1px 0px;
  background-color: ${COLORS.white};
  color: ${COLORS.slateGray}
`

const MonthDateInputSlot = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0px 5px;
  border: 1px solid ${COLORS.lightGray};
  height: 35px;
  width: 50px;
  box-sizing: border-box;
  color: ${COLORS.lightGray}
`

export default TimeSlot
