import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { getUtcizedDayjs } from '../../utils/getUtcizedDayjs'
import { NumberInput } from './NumberInput'
import { formatNumberAsDoubleDigit } from './utils'

import type { NumberInputProps } from './NumberInput'
import type { DateTuple, DateOrTimeInputRef } from './types'
import type { ForwardedRef, MutableRefObject } from 'react'
import type { Promisable } from 'type-fest'

export type DateInputProps = Pick<NumberInputProps, 'onBack' | 'onPrevious' | 'onNext'> & {
  defaultValue?: DateTuple
  isStartDate?: boolean
  /** Called each time the date input is changed to a new valid value. */
  onChange: (nextDateTuple: DateTuple) => Promisable<void>
  onClick: () => Promisable<void>
}
function DateInputWithRef(
  { defaultValue, isStartDate = false, onBack, onChange, onClick, onNext, onPrevious }: DateInputProps,
  ref: ForwardedRef<DateOrTimeInputRef>,
) {
  const boxSpanRef = useRef() as MutableRefObject<HTMLSpanElement>
  const dayInputRef = useRef() as MutableRefObject<HTMLInputElement>
  const monthInputRef = useRef() as MutableRefObject<HTMLInputElement>
  const yearInputRef = useRef() as MutableRefObject<HTMLInputElement>

  const [hasFormatError, setHasFormatError] = useState(false)
  const [hasValidationError, setHasValidationError] = useState(false)

  useImperativeHandle<DateOrTimeInputRef, DateOrTimeInputRef>(ref, () => ({
    boxSpan: boxSpanRef.current,
    focus: (inLastInputOfTheGroup = false) => {
      if (inLastInputOfTheGroup) {
        yearInputRef.current.focus()
      } else {
        dayInputRef.current.focus()
      }
    },
  }))

  const currentUtcYear = useMemo(() => getUtcizedDayjs().year(), [])

  const handleFormatError = useCallback((hasNextFormatError: boolean) => {
    setHasFormatError(hasNextFormatError)
  }, [])

  const submit = useCallback(() => {
    setHasValidationError(false)

    switch (window.document.activeElement) {
      case dayInputRef.current:
        monthInputRef.current.focus()
        break

      case monthInputRef.current:
        yearInputRef.current.focus()
        break

      default:
        break
    }

    if (
      !yearInputRef.current.value.length ||
      !monthInputRef.current.value.length ||
      !dayInputRef.current.value.length
    ) {
      if (
        (monthInputRef.current.value.length && !dayInputRef.current.value.length) ||
        (yearInputRef.current.value.length &&
          (!dayInputRef.current.value.length || !monthInputRef.current.value.length))
      ) {
        setHasValidationError(true)
      }

      return
    }

    const nextDateTuple: DateTuple = [
      String(yearInputRef.current.value),
      formatNumberAsDoubleDigit(monthInputRef.current.value),
      formatNumberAsDoubleDigit(dayInputRef.current.value),
    ]

    onChange(nextDateTuple)
  }, [onChange])

  return (
    <Box ref={boxSpanRef} hasError={hasFormatError || hasValidationError}>
      {isStartDate ? 'Du ' : 'Au '}
      <NumberInput
        ref={dayInputRef}
        defaultValue={defaultValue && formatNumberAsDoubleDigit(defaultValue[2])}
        max={31}
        min={1}
        onBack={onBack}
        onClick={onClick}
        onFilled={submit}
        onFormatError={handleFormatError}
        onNext={() => monthInputRef.current.focus()}
        onPrevious={onPrevious}
        size={2}
      />
      /
      <NumberInput
        ref={monthInputRef}
        defaultValue={defaultValue && formatNumberAsDoubleDigit(defaultValue[1])}
        max={12}
        min={1}
        onBack={() => dayInputRef.current.focus()}
        onClick={onClick}
        onFilled={submit}
        onFormatError={handleFormatError}
        onNext={() => yearInputRef.current.focus()}
        onPrevious={() => dayInputRef.current.focus()}
        size={2}
      />
      /
      <NumberInput
        ref={yearInputRef}
        defaultValue={defaultValue && defaultValue[0]}
        max={currentUtcYear}
        min={2020}
        onBack={() => monthInputRef.current.focus()}
        onClick={onClick}
        onFilled={submit}
        onFormatError={handleFormatError}
        onNext={onNext}
        onPrevious={() => monthInputRef.current.focus()}
        size={4}
      />
    </Box>
  )
}

export const DateInput = forwardRef(DateInputWithRef)

const Box = styled.span<{
  hasError: boolean
}>`
  background-color: ${p => p.theme.color.gainsboro};
  border: solid 1px ${p => (p.hasError ? 'red' : p.theme.color.lightGray)} !important;
  display: inline-block;
  font-size: inherit;
  padding: 0.3125rem 0.5rem 0.4375rem;
`
