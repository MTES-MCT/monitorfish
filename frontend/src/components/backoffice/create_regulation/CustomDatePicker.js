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
    format
  } = props
  return <DatePickerStyled
    isRequired={isRequired}
    value={value}
    onChange={onChange}
    onOk={onOk}
    cleanable={false}
    placement='topStart'
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
      today: 'Aujourd\'hui',
      yesterday: 'Hier',
      hours: 'Heures',
      minutes: 'Minutes',
      seconds: 'Seconds'
    }} />
}

const DatePickerStyled = styled(DatePicker)`
  width: 87px;
  box-sizing: border-box;
  .rs-picker-toggle-caret {
    display: none;
  }
  .rs-picker-toggle {
    border: 1px solid ${props => props.isRequired ? COLORS.red : COLORS.grayDarker}  !important;
    box-sizing: border-box;
  }
  .rs-picker-toggle.rs-btn {
    box-sizing: border-box;
    padding: 6px;
  }
`

export default CustomDatePicker
