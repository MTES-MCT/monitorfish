import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DateRangePicker as RsuiteDateRangePicker } from 'rsuite'
import styled from 'styled-components'

import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter'
import { sortDates } from '../../utils/sortDates'
import { stopMouseEventPropagation } from '../../utils/stopMouseEventPropagation'
import { RSUITE_CALENDAR_LOCALE } from './constants'
import { getDateTupleFromDate } from './utils'

import type { DateRange } from '../../types'
import type { DateTupleRange } from './types'
import type { MutableRefObject } from 'react'
import type { Promisable } from 'type-fest'

type RangeCalendarPickerProps = {
  defaultValue?: DateRange
  onChange: (nextDateTupleRange: DateTupleRange) => Promisable<void>
}
export function RangeCalendarPicker({ defaultValue, onChange }: RangeCalendarPickerProps) {
  const boxRef = useRef() as MutableRefObject<HTMLDivElement>
  const selectedFirstDate = useRef<Date>()
  const calendarRef = useRef<any>()

  const [isFirstLoad, setIsFirstLoad] = useState(true)

  const controlledValue = useMemo(
    () => (defaultValue ? (sortDates(defaultValue) as DateRange) : undefined),
    [defaultValue],
  )

  const handleSelect = useCallback(
    (nextDate: Date) => {
      if (!selectedFirstDate.current) {
        selectedFirstDate.current = nextDate

        return
      }

      const sortedDateRange = sortDates([selectedFirstDate.current, nextDate]) as DateRange
      const [startDate, endDate] = sortedDateRange
      const startDateTuple = getDateTupleFromDate(startDate)
      const endDateTuple = getDateTupleFromDate(endDate)
      const nextDateTupleRange = [startDateTuple, endDateTuple] as DateTupleRange

      onChange(nextDateTupleRange)
    },
    [onChange],
  )

  const renderTitle = useCallback((date: Date) => capitalizeFirstLetter(dayjs(date).format('MMMM YYYY')), [])

  useEffect(() => {
    // We wait for the <Box /> to render so that `boxRef` is defined
    // and can be used as a container for <RsuiteDateRangePicker />
    setIsFirstLoad(false)
  }, [])

  return (
    <Box ref={boxRef} onClick={stopMouseEventPropagation}>
      {!isFirstLoad && (
        <RsuiteDateRangePicker
          ref={calendarRef}
          container={boxRef.current}
          format="yyyy-MM-dd"
          locale={RSUITE_CALENDAR_LOCALE}
          onSelect={handleSelect}
          open
          ranges={[]}
          renderTitle={renderTitle}
          // `defaultValue` seems to be immediatly cancelledso we come down to using a controlled `value`
          value={controlledValue}
        />
      )}
    </Box>
  )
}

const Box = styled.div`
  position: relative;

  .rs-picker-toggle {
    display: none;
  }

  .rs-picker-daterange-menu {
    border: solid 1px ${p => p.theme.color.lightGray};
    border-radius: 0;
    margin-top: 0.5rem;

    .rs-picker-daterange-header,
    .rs-calendar-header-time-toolbar,
    .rs-picker-toolbar {
      display: none;
    }

    .rs-calendar {
      height: auto !important;
      padding: 0;

      :first-child {
        border-right: solid 1px ${p => p.theme.color.lightGray};
      }

      .rs-calendar-header {
        border-bottom: solid 1px ${p => p.theme.color.lightGray};
        padding: 0.5rem;

        .rs-calendar-header-month-toolbar {
          align-items: center;
          display: flex;
          justify-content: space-between;

          .rs-calendar-header-title {
            font-size: inherit;
          }
        }
      }

      .rs-calendar-view {
        padding: 0.75rem 0.5rem 0;
      }
    }
  }
`
