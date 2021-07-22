import React from 'react'
import { DatePicker } from 'rsuite'
import styled from 'styled-components'

const CustomDatePicker = props => {
  return <DatePickerStyled
    cleanable={false}
    placement='topStart'
    placeholder="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
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
  width: 80px;
  box-sizing: border-box;
  .rs-picker-toggle-caret {
    display: none;
  }
`

export default CustomDatePicker
