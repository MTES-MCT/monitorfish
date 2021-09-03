import React from 'react'
import { DatePicker } from 'rsuite'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'

const CustomDatePicker = props => {
  const {
    value,
    onChange,
    onOk,
    isRequired,
    format,
    placement
  } = props
  return <DatePickerStyled
    $isrequired={isRequired}
    oneTap
    ranges={[]}
    value={value}
    onChange={onChange}
    onOk={onOk}
    cleanable={false}
    placement={placement}
    placeholder="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
    format={format}
    locale={{
      sunday: 'Dim',
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Merc',
      thursday: 'Jeudi',
      friday: 'Vend',
      saturday: 'Sam',
      ok: 'OK',
      hours: 'Heures',
      minutes: 'Minutes',
      seconds: 'Secondes'
    }} />
}

const DatePickerStyled = styled(DatePicker)`
  width: 87px;
  box-sizing: border-box;
  color: ${COLORS.gunMetal}
  border-radius: 2px;
  .rs-picker-toggle-caret {
    display: none;
  }
  .rs-picker-toggle {
    border: 1px solid ${props => props.$isrequired ? COLORS.red : COLORS.lightGray}  !important;
    box-sizing: border-box;
  }
  .rs-picker-toggle.rs-btn {
    box-sizing: border-box;
    padding: 6px;
  }
`

export default CustomDatePicker
