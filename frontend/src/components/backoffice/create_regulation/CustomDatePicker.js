import React from 'react'
import { DatePicker } from 'rsuite'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'

const CustomDatePicker = props => {
  const {
    value,
    onChange,
    onOk,
    isRequired
  } = props
  return <DatePickerStyled
    isRequired={isRequired}
    value={value}
    onChange={onChange}
    onOk={onOk}
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
  width: 90px;
  box-sizing: border-box;
  .rs-picker-toggle-caret {
    display: none;
  }
  ${props => props.isRequired ? `border-color: ${COLORS.red};` : ''}
`

export default CustomDatePicker
