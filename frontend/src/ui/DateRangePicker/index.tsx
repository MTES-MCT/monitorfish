import { useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'

import { useForceUpdate } from '../../hooks/useForceUpdate'
import { getLocalizedDayjs } from '../../utils/getLocalizedDayjs'
import { getUtcizedDayjs } from '../../utils/getUtcizedDayjs'
import { DateInput } from './DateInput'
import { RangeCalendarPicker } from './RangeCalendarPicker'
import { TimeInput } from './TimeInput'
import { DateOrTimeInputRef, DateRangePosition, DateTuple, DateTupleRange, TimeTuple } from './types'
import { getDateFromDateAndTimeTuple, getDateTupleFromDate, getTimeTupleFromDate } from './utils'

import type { DateRange } from '../../types'
import type { MutableRefObject } from 'react'
import type { Promisable } from 'type-fest'

export type DateRangePickerProps = {
  defaultValue?: DateRange
  /**
   * Range of minutes used to generate the time picker list.
   *
   * @example
   * `15` would produce a list with `..., 10:45, 11:00, 11:15, ...`.
   */
  minutesRange?: number
  /**
   * Called each time the date range picker is changed to a new valid value.
   *
   * @param newUtcDateRange - A utcized date to be used as is to interact with the API.
   */
  onChange: (newUtcDateRange: DateRange) => Promisable<void>
  withTime?: boolean
}
export function DateRangePicker({ defaultValue, minutesRange = 15, onChange, withTime = false }: DateRangePickerProps) {
  const startDateInput = useRef() as MutableRefObject<DateOrTimeInputRef>
  const startTimeInput = useRef() as MutableRefObject<DateOrTimeInputRef>
  const endDateInput = useRef() as MutableRefObject<DateOrTimeInputRef>
  const endTimeInput = useRef() as MutableRefObject<DateOrTimeInputRef>

  const isRangeCalendarPickerOpen = useRef(false)

  const selectedStartDateRef = useRef<Date | undefined>(
    defaultValue ? getLocalizedDayjs(defaultValue[0]).toDate() : undefined,
  )
  const selectedEndDateRef = useRef<Date | undefined>(
    defaultValue ? getLocalizedDayjs(defaultValue[1]).toDate() : undefined,
  )
  const selectedStartDateTupleRef = useRef<DateTuple | undefined>(getDateTupleFromDate(selectedStartDateRef.current))
  const selectedEndDateTupleRef = useRef<DateTuple | undefined>(getDateTupleFromDate(selectedEndDateRef.current))
  const selectedStartTimeTupleRef = useRef<TimeTuple | undefined>(getTimeTupleFromDate(selectedStartDateRef.current))
  const selectedEndTimeTupleRef = useRef<TimeTuple | undefined>(getTimeTupleFromDate(selectedEndDateRef.current))

  const forceUpdate = useForceUpdate()

  const rangeCalendarPickerDefaultValue =
    selectedStartDateTupleRef.current && selectedEndDateTupleRef.current
      ? ([
          getDateFromDateAndTimeTuple(selectedStartDateTupleRef.current, [0, 0]),
          getDateFromDateAndTimeTuple(selectedEndDateTupleRef.current, [0, 0], true),
        ] as DateRange)
      : undefined

  const submit = useCallback(() => {
    if (!selectedStartDateRef.current || !selectedEndDateRef.current) {
      return
    }

    const utcizedStartDate = getUtcizedDayjs(selectedStartDateRef.current).toDate()
    const utcizedEndDate = getUtcizedDayjs(selectedEndDateRef.current).toDate()

    const newDateRange: DateRange = [utcizedStartDate, utcizedEndDate]
    onChange(newDateRange)
  }, [onChange])

  const closeRangeCalendarPicker = useCallback(() => {
    isRangeCalendarPickerOpen.current = false

    forceUpdate()
  }, [forceUpdate])

  const handleClickOutside = useCallback(
    (event: globalThis.MouseEvent) => {
      const target = event.target as Node | null

      if (startDateInput.current.boxSpan.contains(target) || endDateInput.current.boxSpan.contains(target)) {
        return
      }

      closeRangeCalendarPicker()
    },
    [closeRangeCalendarPicker],
  )

  const handleEndDateInputNext = useCallback(() => {
    if (!withTime) {
      return
    }

    endTimeInput.current.focus()
  }, [withTime])

  const handleEndDateInputPrevious = useCallback(() => {
    if (withTime) {
      startTimeInput.current.focus(true)

      return
    }

    startDateInput.current.focus(true)
  }, [withTime])

  const handleStartDateInputNext = useCallback(() => {
    if (withTime) {
      startTimeInput.current.focus()

      return
    }

    endDateInput.current.focus()
  }, [withTime])

  const handleDateInputFilled = useCallback(
    (position: DateRangePosition, newDateTuple: DateTuple) => {
      if (position === DateRangePosition.START) {
        selectedStartDateTupleRef.current = newDateTuple

        // If a start time has already been selected,
        if (selectedStartTimeTupleRef.current) {
          // we must update the selected start date and call onChange()
          const newStartDate = getDateFromDateAndTimeTuple(newDateTuple, selectedStartTimeTupleRef.current)

          selectedStartDateRef.current = newStartDate

          submit()
        }

        handleStartDateInputNext()
      } else {
        selectedEndDateTupleRef.current = newDateTuple

        // If an end time has already been selected,
        if (selectedEndTimeTupleRef.current) {
          // we must update the selected end date and call onChange()
          const newEndDate = getDateFromDateAndTimeTuple(newDateTuple, selectedEndTimeTupleRef.current, true)

          selectedEndDateRef.current = newEndDate

          submit()
        }

        handleEndDateInputNext()
      }
    },
    [handleEndDateInputNext, handleStartDateInputNext, submit],
  )

  const handleRangeCalendarPickerChange = useCallback(
    (newDateTupleRange: DateTupleRange) => {
      const [newStartDateTuple, newEndDateTuple] = newDateTupleRange

      // If this is a date picker without a time input,
      if (!withTime) {
        // we have to fix the start date at the beginning of the day
        const newStartDate = getDateFromDateAndTimeTuple(newStartDateTuple, [0, 0])
        // and the end date at the end of the day
        const newEndDate = getDateFromDateAndTimeTuple(newEndDateTuple, [23, 59], true)

        selectedStartDateRef.current = newStartDate
        selectedEndDateRef.current = newEndDate
      }

      // If this is a date picker with a time input,
      else {
        // and a start time has already been selected,
        if (selectedStartTimeTupleRef.current) {
          // we must update the selected start date accordingly
          const newStartDate = getDateFromDateAndTimeTuple(newStartDateTuple, selectedStartTimeTupleRef.current)

          selectedStartDateRef.current = newStartDate
        }

        // and an end time has already been selected,
        if (selectedEndTimeTupleRef.current) {
          // we must update the selected end date accordingly
          const newEndDate = getDateFromDateAndTimeTuple(newEndDateTuple, selectedEndTimeTupleRef.current, true)

          selectedEndDateRef.current = newEndDate
        }
      }

      selectedStartDateTupleRef.current = newStartDateTuple
      selectedStartTimeTupleRef.current = getTimeTupleFromDate(selectedStartDateRef.current)
      selectedEndDateTupleRef.current = newEndDateTuple
      selectedEndTimeTupleRef.current = getTimeTupleFromDate(selectedEndDateRef.current)

      closeRangeCalendarPicker()
      forceUpdate()

      submit()
    },
    [closeRangeCalendarPicker, forceUpdate, submit, withTime],
  )

  const handleTimeInputFilled = useCallback(
    (position: DateRangePosition, newTimeTuple: TimeTuple) => {
      if (position === DateRangePosition.START) {
        // If a start date has already been selected
        if (selectedStartDateTupleRef.current) {
          // we must update the selected start date accordingly and submit it
          const newStartDate = getDateFromDateAndTimeTuple(selectedStartDateTupleRef.current, newTimeTuple)

          selectedStartDateRef.current = newStartDate

          submit()
        }

        selectedStartTimeTupleRef.current = newTimeTuple

        endDateInput.current.focus()
      } else {
        // If an end date has already been selected
        if (selectedEndDateTupleRef.current) {
          // we must update the selected end date accordingly and submit it
          const newEndDate = getDateFromDateAndTimeTuple(selectedEndDateTupleRef.current, newTimeTuple, true)

          selectedEndDateRef.current = newEndDate

          submit()
        }

        selectedEndTimeTupleRef.current = newTimeTuple
      }

      submit()
    },
    [submit],
  )

  const openRangeCalendarPicker = useCallback(() => {
    isRangeCalendarPickerOpen.current = true

    forceUpdate()
  }, [forceUpdate])

  useEffect(() => {
    window.document.addEventListener('click', handleClickOutside)

    return () => {
      window.document.removeEventListener('click', handleClickOutside)
    }
  }, [handleClickOutside])

  return (
    <>
      <Box>
        Du{' '}
        <DateInput
          ref={startDateInput}
          defaultValue={selectedStartDateTupleRef.current}
          onChange={newDateTuple => handleDateInputFilled(DateRangePosition.START, newDateTuple)}
          onClick={openRangeCalendarPicker}
          onNext={handleStartDateInputNext}
        />
        {withTime && (
          <>
            ,{' '}
            <TimeInput
              ref={startTimeInput}
              defaultValue={selectedStartTimeTupleRef.current}
              minutesRange={minutesRange}
              onBack={() => startDateInput.current.focus(true)}
              onChange={newTimeTuple => handleTimeInputFilled(DateRangePosition.START, newTimeTuple)}
              onFocus={closeRangeCalendarPicker}
              onNext={() => endDateInput.current.focus()}
              onPrevious={() => startDateInput.current.focus(true)}
            />
          </>
        )}{' '}
        au{' '}
        <DateInput
          ref={endDateInput}
          defaultValue={selectedEndDateTupleRef.current}
          onBack={handleEndDateInputPrevious}
          onChange={newDateTuple => handleDateInputFilled(DateRangePosition.END, newDateTuple)}
          onClick={openRangeCalendarPicker}
          onNext={handleEndDateInputNext}
          onPrevious={handleEndDateInputPrevious}
        />
        {withTime && (
          <>
            ,{' '}
            <TimeInput
              ref={endTimeInput}
              defaultValue={selectedEndTimeTupleRef.current}
              minutesRange={minutesRange}
              onBack={() => endDateInput.current.focus(true)}
              onChange={newTimeTuple => handleTimeInputFilled(DateRangePosition.END, newTimeTuple)}
              onFocus={closeRangeCalendarPicker}
              onPrevious={() => endDateInput.current.focus(true)}
            />
          </>
        )}
      </Box>

      {isRangeCalendarPickerOpen.current && (
        <RangeCalendarPicker
          defaultValue={rangeCalendarPickerDefaultValue}
          onChange={handleRangeCalendarPickerChange}
        />
      )}
    </>
  )
}

const Box = styled.div`
  background-color: lightgray;
  border: solid 1px gray;
  padding: 0.5rem;
`
