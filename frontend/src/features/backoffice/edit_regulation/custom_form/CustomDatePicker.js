/* eslint-disable react/forbid-component-props */
import React, { useState, useCallback } from 'react'
import { DatePicker } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'

/**
 * @enum {string}
 */
export const CUSTOM_DATEPICKER_TYPES = {
  TIME: 'time'
}

function CustomDatePicker(props) {
  const { disabled, format, isRequired, oneTap, placement, saveValue, style, type, value } = props

  const [val, setVal] = useState(undefined)

  const onSelect = useCallback(
    _value => {
      if (oneTap) {
        saveValue(_value)
      } else {
        setVal(_value)
      }
    },
    [setVal, saveValue, oneTap]
  )

  const onOk = useCallback(_value => !oneTap && saveValue(_value), [oneTap, saveValue])
  const onExit = useCallback(_ => val && saveValue(val), [val, saveValue])

  return (
    <DatePickerStyled
      key={value}
      $isrequired={isRequired}
      cleanable={false}
      data-cy={`custom-date-picker-${value}`}
      disabled={disabled}
      format={format}
      locale={{
        formattedDayPattern: 'dd/MM/yyyy',
        formattedMonthPattern: 'dd/MM/yyyy',
        friday: 'Vend',
        hours: 'Heures',
        minutes: 'Minutes',
        monday: 'Lundi',
        ok: 'OK',
        saturday: 'Sam',
        seconds: 'Secondes',
        sunday: 'Dim',
        thursday: 'Jeudi',
        tuesday: 'Mardi',
        wednesday: 'Merc'
      }}
      oneTap={oneTap}
      onExit={onExit}
      onOk={onOk}
      onSelect={onSelect}
      placeholder={
        type === CUSTOM_DATEPICKER_TYPES.TIME
          ? '\xa0\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\xa0\xa0\xa0\xa0'
          : '\xa0\xa0\xa0\xa0\xa0\xa0/\xa0\xa0\xa0\xa0\xa0\xa0/\xa0\xa0\xa0\xa0\xa0\xa0'
      }
      placement={placement}
      ranges={[]}
      style={style}
      value={value}
    />
  )
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
    border: 1px solid ${props => (props.$isrequired ? COLORS.maximumRed : COLORS.lightGray)} !important;
    border-color: ${props => (props.$isrequired ? COLORS.maximumRed : COLORS.lightGray)} !important;
    box-sizing: border-box;
    padding: 6px;
  }
  .rs-picker-toggle.rs-btn:focus {
    border: 1px solid ${props => (props.$isrequired ? COLORS.maximumRed : COLORS.lightGray)} !important;
    border-color: ${props => (props.$isrequired ? COLORS.maximumRed : COLORS.lightGray)} !important;
  }
  .rs-picker-toggle.rs-btn:hover {
    border: 1px solid ${props => (props.$isrequired ? COLORS.maximumRed : COLORS.lightGray)} !important;
    border-color: ${props => (props.$isrequired ? COLORS.maximumRed : COLORS.lightGray)} !important;
  }
  .rs-calendar-month-dropdown-row {
    width: unset !important;
  }
`

export default CustomDatePicker
