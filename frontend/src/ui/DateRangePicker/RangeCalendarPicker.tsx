import dayjs from 'dayjs'
import { useCallback, useRef } from 'react'
import { DateRangePicker as RsuiteDateRangePicker } from 'rsuite'
import styled, { createGlobalStyle } from 'styled-components'

import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter'
import { sortDates } from '../../utils/sortDates'
import { stopMouseEventPropagation } from '../../utils/stopMouseEventPropagation'
import { RSUITE_CALENDAR_LOCALE } from './constants'
import { getDateTupleFromDate } from './utils'

import type { DateRange } from '../../types'
import type { DateTuple, DateTupleRange } from './types'
import type { Promisable } from 'type-fest'

type RangeCalendarPickerProps = {
  onChange: (newDateTupleRange: DateTupleRange) => Promisable<void>
}
export function RangeCalendarPicker({ onChange }: RangeCalendarPickerProps) {
  const selectedFirstDate = useRef<Date>()

  const handleSelect = useCallback(
    (newDate: Date) => {
      if (!selectedFirstDate.current) {
        selectedFirstDate.current = newDate

        return
      }

      const sortedDateRange = sortDates([selectedFirstDate.current, newDate]) as DateRange
      const [startDate, endDate] = sortedDateRange
      const startDateTuple = getDateTupleFromDate(startDate) as DateTuple
      const endDateTuple = getDateTupleFromDate(endDate) as DateTuple
      const newDateTupleRange = [startDateTuple, endDateTuple] as DateTupleRange

      onChange(newDateTupleRange)
    },
    [onChange],
  )

  const renderTitle = useCallback((date: Date) => capitalizeFirstLetter(dayjs(date).format('MMMM YYYY')), [])

  return (
    <Box onClick={stopMouseEventPropagation}>
      <GlobalStyledRsuiteDateRangePicker />
      <StyledRsuiteDateRangePicker
        format="yyyy-MM-dd"
        locale={RSUITE_CALENDAR_LOCALE}
        onSelect={handleSelect}
        open
        ranges={[]}
        renderTitle={renderTitle}
      />
    </Box>
  )
}

const Box = styled.div`
  position: relative;
`

const GlobalStyledRsuiteDateRangePicker = createGlobalStyle`
  .rs-picker-daterange-menu {
    border: solid 1px gray;
    border-radius: 0;
    margin-top: -0.5rem;

    .rs-picker-daterange-header,
    .rs-calendar-header-time-toolbar,
    .rs-picker-toolbar {
      display: none;
    }

    .rs-calendar {
      padding: 0;

      :first-child {
        border-right: solid 1px darkgray;
      }

      .rs-calendar-header {
        border-bottom: solid 1px darkgray;
        padding: 0.5rem;
      }
    }

  }
`

const StyledRsuiteDateRangePicker = styled(RsuiteDateRangePicker)`
  .rs-picker-toggle {
    display: none;
  }
`
