import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'

import { getUtcizedDayjs } from '../../utils/getUtcizedDayjs'
import { NumberInput } from './NumberInput'
import { formatNumberAsDoubleDigit } from './utils'

import type { NumberInputProps } from './NumberInput'
import type { DateTuple, DateOrTimeInputRef } from './types'
import type { ForwardedRef, MutableRefObject } from 'react'
import type { Promisable } from 'type-fest'

export type DateInputProps = Pick<NumberInputProps, 'onBack' | 'onPrevious' | 'onNext'> & {
  defaultValue?: DateTuple
  /** Called each time the date input is changed to a new valid value. */
  onChange: (newDateTuple: DateTuple) => Promisable<void>
  onClick: () => Promisable<void>
}
function DateInputWithRef(
  { defaultValue, onBack, onChange, onClick, onNext, onPrevious }: DateInputProps,
  ref: ForwardedRef<DateOrTimeInputRef>,
) {
  const boxSpan = useRef() as MutableRefObject<HTMLSpanElement>
  const dayInput = useRef() as MutableRefObject<HTMLInputElement>
  const monthInput = useRef() as MutableRefObject<HTMLInputElement>
  const yearInput = useRef() as MutableRefObject<HTMLInputElement>

  const [hasError, setHasError] = useState(false)

  useImperativeHandle<DateOrTimeInputRef, DateOrTimeInputRef>(ref, () => ({
    boxSpan: boxSpan.current,
    focus: (inLastInputOfTheGroup = false) => {
      if (inLastInputOfTheGroup) {
        yearInput.current.focus()
      } else {
        dayInput.current.focus()
      }
    },
  }))

  const currentUtcYear = useMemo(() => getUtcizedDayjs().year(), [])

  const submit = useCallback(() => {
    setHasError(false)

    switch (window.document.activeElement) {
      case dayInput.current:
        monthInput.current.focus()
        break

      case monthInput.current:
        yearInput.current.focus()
        break

      default:
        break
    }

    if (!yearInput.current.value.length || !monthInput.current.value.length || !dayInput.current.value.length) {
      if (
        (monthInput.current.value.length && !dayInput.current.value.length) ||
        (yearInput.current.value.length && (!dayInput.current.value.length || !monthInput.current.value.length))
      ) {
        setHasError(true)
      }

      return
    }

    const newDateTuple: DateTuple = [
      Number(yearInput.current.value),
      Number(monthInput.current.value),
      Number(dayInput.current.value),
    ]

    onChange(newDateTuple)
  }, [onChange])

  return (
    <span ref={boxSpan}>
      <NumberInput
        ref={dayInput}
        defaultValue={defaultValue && formatNumberAsDoubleDigit(defaultValue[2])}
        hasError={hasError}
        max={31}
        min={1}
        onBack={onBack}
        onClick={onClick}
        onFilled={submit}
        onNext={() => monthInput.current.focus()}
        onPrevious={onPrevious}
        size={2}
      />
      /
      <NumberInput
        ref={monthInput}
        defaultValue={defaultValue && formatNumberAsDoubleDigit(defaultValue[1])}
        hasError={hasError}
        max={12}
        min={1}
        onBack={() => dayInput.current.focus()}
        onClick={onClick}
        onFilled={submit}
        onNext={() => yearInput.current.focus()}
        onPrevious={() => dayInput.current.focus()}
        size={2}
      />
      /
      <NumberInput
        ref={yearInput}
        defaultValue={defaultValue && defaultValue[0]}
        hasError={hasError}
        max={currentUtcYear}
        min={2020}
        onBack={() => monthInput.current.focus()}
        onClick={onClick}
        onFilled={submit}
        onNext={onNext}
        onPrevious={() => monthInput.current.focus()}
        size={4}
      />
    </span>
  )
}

export const DateInput = forwardRef(DateInputWithRef)
