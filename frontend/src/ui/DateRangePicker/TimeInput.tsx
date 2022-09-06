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
  onChange: (newTimeTuple: TimeTuple) => Promisable<void>
  onFocus?: () => Promisable<void>
  onNext?: () => Promisable<void>
  onPrevious?: () => Promisable<void>
}
function TimeInputWithRef(
  { defaultValue, minutesRange = 15, onBack, onChange, onFocus, onNext, onPrevious }: TimeInputProps,
  ref: ForwardedRef<DateOrTimeInputRef>,
) {
  const boxSpan = useRef() as MutableRefObject<HTMLSpanElement>
  const hourInput = useRef() as MutableRefObject<HTMLInputElement>
  const minuteInput = useRef() as MutableRefObject<HTMLInputElement>

  const [controlledDefaultValue, setControlledDefaultValue] = useState(defaultValue)
  const [hasError, setHasError] = useState(false)

  useImperativeHandle<DateOrTimeInputRef, DateOrTimeInputRef>(ref, () => ({
    boxSpan: boxSpan.current,
    focus: (inLastInputOfTheGroup = false) => {
      if (inLastInputOfTheGroup) {
        minuteInput.current.focus()
      } else {
        hourInput.current.focus()
      }
    },
  }))

  const isRangedTimePickerOpen = useRef(false)

  const [rangedTimePickerFilter, setRangedTimePickerFilter] = useState<RegExp>(/.*/)

  const forceUpdate = useForceUpdate()

  const closeRangedTimePicker = useCallback(() => {
    isRangedTimePickerOpen.current = false

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

      if (hourInput.current.contains(target) || minuteInput.current.contains(target)) {
        return
      }

      closeRangedTimePicker()
    },
    [closeRangedTimePicker],
  )

  const handleRangedTimePickedChange = useCallback(
    (newTimeTuple: TimeTuple) => {
      closeRangedTimePicker()

      setControlledDefaultValue(newTimeTuple)

      onChange(newTimeTuple)
    },
    [closeRangedTimePicker, onChange],
  )

  const handleHourInput = useCallback((newValue: string) => {
    // eslint-disable-next-line no-nested-ternary
    const newRangedTimePickerFilter = newValue.length ? new RegExp(`^${newValue}`) : /.*/

    setRangedTimePickerFilter(newRangedTimePickerFilter)
  }, [])

  const openRangedTimePicker = useCallback(() => {
    isRangedTimePickerOpen.current = true

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

    if (window.document.activeElement === hourInput.current) {
      minuteInput.current.focus()
    }

    if (!hourInput.current.value.length || !minuteInput.current.value.length) {
      if (minuteInput.current.value.length && !hourInput.current.value.length) {
        setHasError(true)
      }

      return
    }

    closeRangedTimePicker()

    const newTimeTuple: TimeTuple = [hourInput.current.value, minuteInput.current.value]
    onChange(newTimeTuple)
  }, [closeRangedTimePicker, onChange])

  return (
    <Box ref={boxSpan}>
      <>
        <NumberInput
          ref={hourInput}
          defaultValue={controlledDefaultValue && controlledDefaultValue[0]}
          hasError={hasError}
          max={23}
          min={0}
          onBack={handleBack}
          onClick={openRangedTimePicker}
          onFilled={submit}
          onFocus={onFocus}
          onInput={handleHourInput}
          onNext={() => minuteInput.current.focus()}
          onPrevious={onPrevious}
          size={2}
        />
        :
        <NumberInput
          ref={minuteInput}
          defaultValue={controlledDefaultValue && controlledDefaultValue[1]}
          hasError={hasError}
          max={59}
          min={0}
          onBack={() => hourInput.current.focus()}
          onClick={openRangedTimePicker}
          onFilled={submit}
          onFocus={onFocus}
          onNext={onNext}
          onPrevious={() => hourInput.current.focus()}
          size={2}
        />
      </>

      {isRangedTimePickerOpen.current && (
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
