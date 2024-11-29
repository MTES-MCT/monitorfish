import React, { useState, useCallback } from 'react'
import { DatePicker } from 'rsuite'
import styled from 'styled-components'

import type { TypeAttributes } from 'rsuite/esm/@types/common'

/**
 * @enum {string}
 */
export const CUSTOM_DATEPICKER_TYPES = {
  TIME: 'time'
}

type CustomDatePickerProps = Readonly<{
  disabled: boolean
  format: string
  isRequired?: boolean
  oneTap: boolean
  placement: TypeAttributes.Placement
  saveValue: (value: Date) => void
  style?: React.CSSProperties
  type?: string
  value: string | Date | undefined
}>
export function CustomDatePicker({
  disabled,
  format,
  isRequired = false,
  oneTap,
  placement,
  saveValue,
  style,
  type,
  value
}: CustomDatePickerProps) {
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
      key={`${value}`}
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
      style={style as any}
      // eslint-disable-next-line no-nested-ternary
      value={value ? (value instanceof Date ? value : new Date(value)) : null}
    />
  )
}

const DatePickerStyled = styled(DatePicker)`
  width: 120px;
  box-sizing: border-box;
  color: ${p => p.theme.color.gunMetal}!important;
  border-radius: 2px;
  .rs-picker-toggle-caret {
    display: none;
  }
  .rs-picker-toggle {
    box-sizing: border-box;
    color: ${p => p.theme.color.lightGray};
  }
  .rs-picker-toggle .rs-picker-toggle-placeholder {
    color: ${p => p.theme.color.lightGray}!important;
  }
  .rs-picker-toggle .rs-picker-toggle-value {
    color: ${p => p.theme.color.gunMetal}!important;
  }

  .rs-picker-toggle.rs-btn {
    border: 1px solid ${p => (p.$isrequired ? p.theme.color.maximumRed : p.theme.color.lightGray)} !important;
    border-color: ${p => (p.$isrequired ? p.theme.color.maximumRed : p.theme.color.lightGray)} !important;
    box-sizing: border-box;
    padding: 6px;
  }
  .rs-picker-toggle.rs-btn:focus {
    border: 1px solid ${p => (p.$isrequired ? p.theme.color.maximumRed : p.theme.color.lightGray)} !important;
    border-color: ${p => (p.$isrequired ? p.theme.color.maximumRed : p.theme.color.lightGray)} !important;
  }
  .rs-picker-toggle.rs-btn:hover {
    border: 1px solid ${p => (p.$isrequired ? p.theme.color.maximumRed : p.theme.color.lightGray)} !important;
    border-color: ${p => (p.$isrequired ? p.theme.color.maximumRed : p.theme.color.lightGray)} !important;
  }
  .rs-calendar-month-dropdown-row {
    width: unset !important;
  }
`
