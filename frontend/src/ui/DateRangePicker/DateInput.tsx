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
  onChange: (nextDateTuple: DateTuple) => Promisable<void>
  onClick: () => Promisable<void>
}
function DateInputWithRef(
  { defaultValue, onBack, onChange, onClick, onNext, onPrevious }: DateInputProps,
  ref: ForwardedRef<DateOrTimeInputRef>,
) {
  const boxSpanRef = useRef() as MutableRefObject<HTMLSpanElement>
  const dayInputRef = useRef() as MutableRefObject<HTMLInputElement>
  const monthInputRef = useRef() as MutableRefObject<HTMLInputElement>
  const yearInputRef = useRef() as MutableRefObject<HTMLInputElement>

  const [hasError, setHasError] = useState(false)

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

  const submit = useCallback(() => {
    setHasError(false)

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
        setHasError(true)
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
    <span ref={boxSpanRef}>
      <NumberInput
        ref={dayInputRef}
        defaultValue={defaultValue && formatNumberAsDoubleDigit(defaultValue[2])}
        hasError={hasError}
        max={31}
        min={1}
        onBack={onBack}
        onClick={onClick}
        onFilled={submit}
        onNext={() => monthInputRef.current.focus()}
        onPrevious={onPrevious}
        size={2}
      />
      /
      <NumberInput
        ref={monthInputRef}
        defaultValue={defaultValue && formatNumberAsDoubleDigit(defaultValue[1])}
        hasError={hasError}
        max={12}
        min={1}
        onBack={() => dayInputRef.current.focus()}
        onClick={onClick}
        onFilled={submit}
        onNext={() => yearInputRef.current.focus()}
        onPrevious={() => dayInputRef.current.focus()}
        size={2}
      />
      /
      <NumberInput
        ref={yearInputRef}
        defaultValue={defaultValue && defaultValue[0]}
        hasError={hasError}
        max={currentUtcYear}
        min={2020}
        onBack={() => monthInputRef.current.focus()}
        onClick={onClick}
        onFilled={submit}
        onNext={onNext}
        onPrevious={() => monthInputRef.current.focus()}
        size={4}
      />
    </span>
  )
}

export const DateInput = forwardRef(DateInputWithRef)
