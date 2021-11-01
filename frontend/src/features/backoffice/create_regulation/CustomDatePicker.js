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
    date-cy="custom-date-picker"
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
  color: ${COLORS.gunMetal}!important;
  border-radius: 2px;
  .rs-picker-toggle-caret {
    display: none;
  }
  .rs-picker-toggle {
    box-sizing: border-box;
    color: ${COLORS.lightGray};
  }
  .rs-picker-toggle .rs-picker-toggle-placeholder {
    color: ${COLORS.lightGray}!important;
  }
  .rs-picker-toggle .rs-picker-toggle-value {
    color: ${COLORS.gunMetal}!important;
  }

  .rs-picker-toggle.rs-btn {
    border: 1px solid ${props => props.$isrequired ? COLORS.red : COLORS.lightGray}  !important;
    box-sizing: border-box;
    padding: 6px;
  }
  .rs-picker-toggle.rs-btn:focus {
    border: 1px solid ${COLORS.lightGray}!important;
  }
  .rs-picker-toggle.rs-btn:hover {
    border: 1px solid ${COLORS.lightGray}!important;
  }
`

export default CustomDatePicker
