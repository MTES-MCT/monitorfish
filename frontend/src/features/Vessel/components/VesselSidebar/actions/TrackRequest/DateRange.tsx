// TODO This component is still use by 1 other, we need to replace it and delete this file.

import { getLocalizedDayjs, getUtcizedDayjs } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo } from 'react'
import { DateRangePicker } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../../../../constants/constants'

import type { DateRange as RsuiteDateRange } from 'rsuite/esm/DateRangePicker'

/** @type {import('rsuite').DateRangePickerLocale} */
export const DATE_RANGE_PICKER_LOCALE = {
  friday: 'Ve',
  last7Days: '7 derniers jours',
  monday: 'Lu',
  ok: 'OK',
  saturday: 'Sa',
  sunday: 'Di',
  thursday: 'Je',
  today: "Aujourd'hui",
  tuesday: 'Ma',
  wednesday: 'Me',
  yesterday: 'Hier'
}

type DateRangeProps = {
  containerRef: HTMLElement | (() => HTMLElement)
  defaultValue?: [Date, Date]
  isDisabledAfterToday?: boolean
  noMargin?: boolean
  onChange: (dateRange?: [Date, Date]) => void
  placeholder: string
  width?: number
}
export function DateRange({
  containerRef,
  defaultValue,
  isDisabledAfterToday = false,
  noMargin = false,
  onChange,
  placeholder,
  width
}: DateRangeProps) {
  const normalizedDefaultValue = useMemo(
    () =>
      defaultValue ? [getLocalizedDayjs(defaultValue[0]).toDate(), getLocalizedDayjs(defaultValue[1]).toDate()] : null,
    [defaultValue]
  )
  const disabledDate = useMemo(
    () => (isDisabledAfterToday ? (DateRangePicker.afterToday as any)() : (DateRangePicker.beforeToday as any)()),
    [isDisabledAfterToday]
  )

  /**
   * @param {[Date, Date]} dateRange
   */
  const handleChange = useCallback(
    ([localStartDate, localEndDate]) => {
      const utcizedStartDate = getUtcizedDayjs(localStartDate).startOf('day').toDate()
      // TODO For some reason the API can't handle milliseconds in date.
      const utcizedEndDate = getUtcizedDayjs(localEndDate).endOf('day').millisecond(0).toDate()

      onChange([utcizedStartDate, utcizedEndDate])
    },
    [onChange]
  )

  const handleClear = useCallback(() => {
    onChange(undefined)
  }, [onChange])

  return (
    <Wrapper
      key={JSON.stringify(normalizedDefaultValue)}
      $isEmpty={!normalizedDefaultValue}
      $noMargin={noMargin}
      $width={width}
    >
      <DateRangePicker
        cleanable
        container={containerRef}
        defaultValue={normalizedDefaultValue as RsuiteDateRange | null}
        disabledDate={disabledDate}
        format="dd-MM-yyyy"
        locale={DATE_RANGE_PICKER_LOCALE}
        onClean={handleClear}
        onOk={handleChange}
        placeholder={placeholder}
        placement="auto"
        ranges={[]}
        showOneCalendar
        size="sm"
      />
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $isEmpty: boolean
  $noMargin: boolean
  $width: number | undefined
}>`
  margin: ${p => (p.$noMargin ? 0 : '12px 0 20px 20px')};
  width: ${p => p.$width ?? 197}px;

  .rs-picker-daterange {
    background: ${p => (p.$isEmpty ? COLORS.gainsboro : 'transparent')};
  }

  input {
    font-size: 13px;
  }
  .rs-picker-toggle-placeholder {
    font-size: 13px;
  }
`
