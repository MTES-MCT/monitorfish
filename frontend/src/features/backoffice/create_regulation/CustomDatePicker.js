import React from 'react'
import { DatePicker } from 'rsuite'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'

/**
 * @enum {string}
 */
export const CUSTOM_DATEPICKER_TYPES = {
  TIME: 'time'
}

const CustomDatePicker = props => {
  const {
    onSelect,
    type,
    value,
    onChange,
    onOk,
    isRequired,
    format,
    placement,
    style,
    // oneTap,
    disabled
  } = props

  return <DatePickerStyled
    key={value}
    data-cy={`custom-date-picker-${value}`}
    $isrequired={isRequired}
    disabled={disabled}
    oneTap={false}
    ranges={[]}
    value={value}
    onChange={onChange}
    onOk={onOk}
    onSelect={onSelect}
    onExiting={onChange}
    shouldCloseOnSelect={false}
    cleanable={false}
    placement={placement}
    placeholder={type === CUSTOM_DATEPICKER_TYPES.TIME
      ? '\xa0\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\xa0\xa0\xa0\xa0'
      : '\xa0\xa0\xa0\xa0\xa0\xa0/\xa0\xa0\xa0\xa0\xa0\xa0/\xa0\xa0\xa0\xa0\xa0\xa0'}
    format={format}
    style={style}
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
    border-color: ${props => props.$isrequired ? COLORS.red : COLORS.lightGray} !important;
    box-sizing: border-box;
    padding: 6px;
  }
  .rs-picker-toggle.rs-btn:focus {
    border: 1px solid ${props => props.$isrequired ? COLORS.red : COLORS.lightGray}  !important;
    border-color: ${props => props.$isrequired ? COLORS.red : COLORS.lightGray} !important;
  }
  .rs-picker-toggle.rs-btn:hover {
    border: 1px solid ${props => props.$isrequired ? COLORS.red : COLORS.lightGray}  !important;
    border-color: ${props => props.$isrequired ? COLORS.red : COLORS.lightGray} !important;
  }
`

export default CustomDatePicker
