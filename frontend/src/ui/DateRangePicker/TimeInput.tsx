import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import styled from 'styled-components'

import { useForceUpdate } from '../../hooks/useForceUpdate'
import { NumberInput } from './NumberInput'
import { RangedTimePicker } from './RangedTimePicker'

import type { NumberInputProps } from './NumberInput'
import type { DateOrTimeInputRef, TimeTuple } from './types'
import type { ForwardedRef, MutableRefObject } from 'react'
import type { Promisable } from 'type-fest'

export type TimeInputProps = Pick<NumberInputProps, 'onBack' | 'onPrevious' | 'onNext'> & {
  defaultValue?: TimeTuple
  isStartDate?: boolean
  minutesRange?: number
  /** Called each time the time input is changed to a new valid value. */
  onChange: (nextTimeTuple: TimeTuple) => Promisable<void>
  onFocus?: () => Promisable<void>
  onNext?: () => Promisable<void>
  onPrevious?: () => Promisable<void>
}
function TimeInputWithRef(
  {
    defaultValue,
    isStartDate = false,
    minutesRange = 15,
    onBack,
    onChange,
    onFocus,
    onNext,
    onPrevious
  }: TimeInputProps,
  ref: ForwardedRef<DateOrTimeInputRef>
) {
  const boxSpanRef = useRef() as MutableRefObject<HTMLSpanElement>
  const hourInputRef = useRef() as MutableRefObject<HTMLInputElement>
  const minuteInputRef = useRef() as MutableRefObject<HTMLInputElement>

  const [controlledDefaultValue, setControlledDefaultValue] = useState(defaultValue)
  const [hasFormatError, setHasFormatError] = useState(false)
  const [hasValidationError, setHasValidationError] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  useImperativeHandle<DateOrTimeInputRef, DateOrTimeInputRef>(ref, () => ({
    boxSpan: boxSpanRef.current,
    focus: (isInLastInputOfTheGroup = false) => {
      if (isInLastInputOfTheGroup) {
        minuteInputRef.current.focus()
      } else {
        hourInputRef.current.focus()
      }
    }
  }))

  const isRangedTimePickerOpenRef = useRef(false)

  const [rangedTimePickerFilter, setRangedTimePickerFilter] = useState<RegExp>(/.*/)

  const { forceUpdate } = useForceUpdate()

  const closeRangedTimePicker = useCallback(() => {
    isRangedTimePickerOpenRef.current = false

    forceUpdate()
  }, [forceUpdate])

  const handleBack = useCallback(() => {
    if (!onBack) {
      return
    }

    closeRangedTimePicker()

    onBack()
  }, [closeRangedTimePicker, onBack])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  const handleClickOutside = useCallback(
    (event: globalThis.MouseEvent) => {
      const target = event.target as Node | null

      if (hourInputRef.current.contains(target) || minuteInputRef.current.contains(target)) {
        return
      }

      closeRangedTimePicker()
    },
    [closeRangedTimePicker]
  )

  const handleFocus = useCallback(() => {
    setIsFocused(true)

    if (onFocus) {
      onFocus()
    }
  }, [onFocus])

  const handleFormatError = useCallback((hasNextFormatError: boolean) => {
    setHasFormatError(hasNextFormatError)
  }, [])

  const handleRangedTimePickedChange = useCallback(
    (nextTimeTuple: TimeTuple) => {
      closeRangedTimePicker()

      setControlledDefaultValue(nextTimeTuple)

      onChange(nextTimeTuple)
    },
    [closeRangedTimePicker, onChange]
  )

  const handleHourInput = useCallback((nextValue: string) => {
    // eslint-disable-next-line no-nested-ternary
    const nextRangedTimePickerFilter = nextValue.length ? new RegExp(`^${nextValue}`) : /.*/

    setRangedTimePickerFilter(nextRangedTimePickerFilter)
  }, [])

  const openRangedTimePicker = useCallback(() => {
    isRangedTimePickerOpenRef.current = true

    forceUpdate()
  }, [forceUpdate])

  useEffect(() => {
    window.document.addEventListener('click', handleClickOutside)

    return () => {
      window.document.removeEventListener('click', handleClickOutside)
    }
  }, [handleClickOutside])

  const submit = useCallback(() => {
    setHasValidationError(false)

    if (window.document.activeElement === hourInputRef.current) {
      minuteInputRef.current.focus()
    }

    if (!hourInputRef.current.value.length || !minuteInputRef.current.value.length) {
      if (minuteInputRef.current.value.length && !hourInputRef.current.value.length) {
        setHasValidationError(true)
      }

      return
    }

    closeRangedTimePicker()

    const nextTimeTuple: TimeTuple = [hourInputRef.current.value, minuteInputRef.current.value]
    onChange(nextTimeTuple)
  }, [closeRangedTimePicker, onChange])

  return (
    <Box ref={boxSpanRef} hasError={hasFormatError || hasValidationError} isFocused={isFocused}>
      <>
        <NumberInput
          ref={hourInputRef}
          data-cy={`date-range-picker-${isStartDate ? 'start' : 'end'}-hour`}
          defaultValue={controlledDefaultValue && controlledDefaultValue[0]}
          max={23}
          min={0}
          onBack={handleBack}
          onBlur={handleBlur}
          onClick={openRangedTimePicker}
          onFilled={submit}
          onFocus={handleFocus}
          onFormatError={handleFormatError}
          onInput={handleHourInput}
          onNext={() => minuteInputRef.current.focus()}
          onPrevious={onPrevious}
          size={2}
        />
        :
        <NumberInput
          ref={minuteInputRef}
          data-cy={`date-range-picker-${isStartDate ? 'start' : 'end'}-minute`}
          defaultValue={controlledDefaultValue && controlledDefaultValue[1]}
          max={59}
          min={0}
          onBack={() => hourInputRef.current.focus()}
          onBlur={handleBlur}
          onClick={openRangedTimePicker}
          onFilled={submit}
          onFocus={handleFocus}
          onFormatError={handleFormatError}
          onNext={onNext}
          onPrevious={() => hourInputRef.current.focus()}
          size={2}
        />
      </>

      {isRangedTimePickerOpenRef.current && (
        <RangedTimePicker
          filter={rangedTimePickerFilter}
          minutesRange={minutesRange}
          onChange={handleRangedTimePickedChange}
        />
      )}
    </Box>
  )
}

export const TimeInput = forwardRef(TimeInputWithRef)

const Box = styled.span<{
  hasError: boolean
  isFocused: boolean
}>`
  background-color: ${p => p.theme.color.gainsboro};
  box-shadow: ${p =>
    p.hasError || p.isFocused
      ? `inset 0px 0px 0px 1px ${p.hasError ? p.theme.color.maximumRed : p.theme.color.blueGray[100]}`
      : 'none'};
  color: ${p => p.theme.color.slateGray};
  display: inline-block;
  font-size: inherit;
  padding: 0.3125rem 0.5rem 0.4375rem;
  position: relative;
  user-select: none;

  :hover {
    box-shadow: ${p => `inset 0px 0px 0px 1px ${p.theme.color.blueYonder[100]}`};
  }
`
