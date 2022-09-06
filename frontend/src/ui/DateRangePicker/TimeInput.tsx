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
  minutesRange?: number
  /** Called each time the time input is changed to a new valid value. */
  onChange: (nextTimeTuple: TimeTuple) => Promisable<void>
  onFocus?: () => Promisable<void>
  onNext?: () => Promisable<void>
  onPrevious?: () => Promisable<void>
}
function TimeInputWithRef(
  { defaultValue, minutesRange = 15, onBack, onChange, onFocus, onNext, onPrevious }: TimeInputProps,
  ref: ForwardedRef<DateOrTimeInputRef>,
) {
  const boxSpanRef = useRef() as MutableRefObject<HTMLSpanElement>
  const hourInputRef = useRef() as MutableRefObject<HTMLInputElement>
  const minuteInputRef = useRef() as MutableRefObject<HTMLInputElement>

  const [controlledDefaultValue, setControlledDefaultValue] = useState(defaultValue)
  const [hasError, setHasError] = useState(false)

  useImperativeHandle<DateOrTimeInputRef, DateOrTimeInputRef>(ref, () => ({
    boxSpan: boxSpanRef.current,
    focus: (inLastInputOfTheGroup = false) => {
      if (inLastInputOfTheGroup) {
        minuteInputRef.current.focus()
      } else {
        hourInputRef.current.focus()
      }
    },
  }))

  const isRangedTimePickerOpenRef = useRef(false)

  const [rangedTimePickerFilter, setRangedTimePickerFilter] = useState<RegExp>(/.*/)

  const forceUpdate = useForceUpdate()

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

  const handleClickOutside = useCallback(
    (event: globalThis.MouseEvent) => {
      const target = event.target as Node | null

      if (hourInputRef.current.contains(target) || minuteInputRef.current.contains(target)) {
        return
      }

      closeRangedTimePicker()
    },
    [closeRangedTimePicker],
  )

  const handleRangedTimePickedChange = useCallback(
    (nextTimeTuple: TimeTuple) => {
      closeRangedTimePicker()

      setControlledDefaultValue(nextTimeTuple)

      onChange(nextTimeTuple)
    },
    [closeRangedTimePicker, onChange],
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
    setHasError(false)

    if (window.document.activeElement === hourInputRef.current) {
      minuteInputRef.current.focus()
    }

    if (!hourInputRef.current.value.length || !minuteInputRef.current.value.length) {
      if (minuteInputRef.current.value.length && !hourInputRef.current.value.length) {
        setHasError(true)
      }

      return
    }

    closeRangedTimePicker()

    const nextTimeTuple: TimeTuple = [hourInputRef.current.value, minuteInputRef.current.value]
    onChange(nextTimeTuple)
  }, [closeRangedTimePicker, onChange])

  return (
    <Box ref={boxSpanRef}>
      <>
        <NumberInput
          ref={hourInputRef}
          defaultValue={controlledDefaultValue && controlledDefaultValue[0]}
          hasError={hasError}
          max={23}
          min={0}
          onBack={handleBack}
          onClick={openRangedTimePicker}
          onFilled={submit}
          onFocus={onFocus}
          onInput={handleHourInput}
          onNext={() => minuteInputRef.current.focus()}
          onPrevious={onPrevious}
          size={2}
        />
        :
        <NumberInput
          ref={minuteInputRef}
          defaultValue={controlledDefaultValue && controlledDefaultValue[1]}
          hasError={hasError}
          max={59}
          min={0}
          onBack={() => hourInputRef.current.focus()}
          onClick={openRangedTimePicker}
          onFilled={submit}
          onFocus={onFocus}
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

const Box = styled.span`
  display: inline-block;
  position: relative;
`
