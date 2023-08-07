// TODO This component is still use by 2 others, we need to replace it and delete this file.

import { getLocalizedDayjs, getUtcizedDayjs } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo } from 'react'
import { DateRangePicker } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'

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
  yesterday: 'Hier',
}

/**
 * @typedef {object} DateRangeProps
 * @property {HTMLElement | (() => HTMLElement)=} containerRef
 * @property {[Date, Date]=} defaultValue
 * @property {boolean=} isDisabledAfterToday
 * @property {boolean=} noMargin
 * @property {(dateRange?: [Date, Date]) => void} onChange
 * @property {string} placeholder
 * @property {number=} width
 */

/**
 * @param {DateRangeProps} props
 */
function DateRange({
  containerRef,
  defaultValue,
  isDisabledAfterToday = false,
  noMargin = false,
  onChange,
  placeholder,
  width,
}) {
  /** @type {[Date, Date] | undefined} */
  const normalizedDefaultValue = useMemo(
    () =>
      defaultValue
        ? [getLocalizedDayjs(defaultValue[0]).toDate(), getLocalizedDayjs(defaultValue[1]).toDate()]
        : undefined,
    [defaultValue],
  )
  const disabledDate = useMemo(
    () => (isDisabledAfterToday ? DateRangePicker.afterToday() : DateRangePicker.beforeToday()),
    [isDisabledAfterToday],
  )

  /**
   * @param {[Date, Date]} dateRange
   */
  const handleChange = useCallback(
    ([localStartDate, localEndDate]) => {
      const utcizedStartDate = getUtcizedDayjs(localStartDate).startOf('day').toDate()
      // TODO For some reason the API can't handle miliseconds in date.
      const utcizedEndDate = getUtcizedDayjs(localEndDate).endOf('day').millisecond(0).toDate()

      onChange([utcizedStartDate, utcizedEndDate])
    },
    [onChange],
  )

  const handleClear = useCallback(() => {
    onChange(undefined)
  }, [onChange])

  return (
    <Wrapper key={normalizedDefaultValue} isEmpty={!normalizedDefaultValue} noMargin={noMargin} width={width}>
      <DateRangePicker
        cleanable
        container={containerRef}
        defaultValue={normalizedDefaultValue}
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

const Wrapper = styled.div`
  margin: ${p => (p.noMargin ? 0 : '12px 0 20px 20px')};
  width: ${p => p.width || 197}px;

  .rs-picker-daterange {
    background: ${p => (p.isEmpty ? COLORS.gainsboro : 'transparent')};
  }

  input {
    font-size: 13px;
  }
  .rs-picker-toggle-placeholder {
    font-size: 13px;
  }
`

export default DateRange
