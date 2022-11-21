/* eslint-disable react/jsx-props-no-spreading */
import { useField } from 'formik'
import { MutableRefObject, useRef } from 'react'
import { DatePicker } from 'rsuite'
import { parseISO } from 'rsuite/esm/utils/dateUtils'
import styled from 'styled-components'

export const placeholderDateTimePicker =
  '\xa0\xa0\xa0\xa0\xa0\xa0/\xa0\xa0\xa0\xa0\xa0\xa0/\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\xa0\xa0\xa0\xa0'

type FormikDatePickerProps = {
  [x: string]: any
  ghost?: boolean
  name: string
}
export function FormikDatePicker({ ghost, name, ...props }: FormikDatePickerProps) {
  const [field, , helpers] = useField(name)
  const { value } = field
  const { setValue } = helpers

  const setValueAsString = date => {
    const dateAsString = date ? date.toISOString() : null
    setValue(dateAsString)
  }
  // parseISO cannot parse undefined. Returns 'Invalid Date' if it cannot parse value.
  const parsedValue = parseISO(value || null)
  const valueAsDate = parsedValue.toString() === 'Invalid Date' ? null : parsedValue
  const datepickerRef = useRef() as MutableRefObject<HTMLDivElement>

  return (
    <DatePickerWrapper ref={datepickerRef} data-cy="datepicker">
      <DatePicker
        className={`${ghost && 'ghost'}`}
        container={() => datepickerRef.current}
        {...props}
        onChange={setValueAsString}
        value={valueAsDate}
      />
    </DatePickerWrapper>
  )
}

const DatePickerWrapper = styled.div`
  width: 250px;
  .rs-picker-date-menu {
    position: relative;
    margin-top: -32px;
  }
`
