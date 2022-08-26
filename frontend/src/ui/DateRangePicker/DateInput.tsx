import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react'

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
        max={31}
        min={1}
        onBack={onBack}
        onClick={onClick}
        onFilled={() => monthInput.current.focus()}
        onNext={() => monthInput.current.focus()}
        onPrevious={onPrevious}
        size={2}
      />
      /
      <NumberInput
        ref={monthInput}
        defaultValue={defaultValue && formatNumberAsDoubleDigit(defaultValue[1])}
        max={12}
        min={1}
        onBack={() => dayInput.current.focus()}
        onClick={onClick}
        onFilled={() => yearInput.current.focus()}
        onNext={() => yearInput.current.focus()}
        onPrevious={() => dayInput.current.focus()}
        size={2}
      />
      /
      <NumberInput
        ref={yearInput}
        defaultValue={defaultValue && defaultValue[0]}
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
