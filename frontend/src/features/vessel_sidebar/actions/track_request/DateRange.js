import { useCallback, useMemo } from 'react'
import { DateRangePicker } from 'rsuite'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { CustomDate } from '../../../../libs/CustomDate'

/** @type {import('rsuite').DateRangePickerLocale} */
const DATE_RANGE_PICKER_LOCALE = {
  sunday: 'Di',
  monday: 'Lu',
  tuesday: 'Ma',
  wednesday: 'Me',
  thursday: 'Je',
  friday: 'Ve',
  saturday: 'Sa',
  ok: 'OK',
  today: "Aujourd'hui",
  yesterday: 'Hier',
  last7Days: '7 derniers jours'
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
const DateRange = ({
  containerRef,
  defaultValue,
  isDisabledAfterToday = false,
  noMargin = false,
  onChange,
  placeholder,
  width
}) => {
  /** @type {[Date, Date] | undefined} */
  const normalizedDefaultValue = useMemo(
    () => defaultValue
      ? [CustomDate.fixOffset(defaultValue[0]), CustomDate.fixOffset(defaultValue[1])]
      : undefined,
    [defaultValue]
  )
  const disabledDate = useMemo(
    () => isDisabledAfterToday ? DateRangePicker.afterToday() : DateRangePicker.beforeToday(),
    [isDisabledAfterToday]
  )

  /**
   * @param {[Date, Date]} dateRange
   */
  const handleChange = useCallback(([startDate, endDate]) => {
    const cleanStartDate = new CustomDate(startDate).toStartOfDay()
    const cleanEndDate = new CustomDate(endDate).toEndOfDay()

    onChange([cleanStartDate, cleanEndDate])
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange(undefined)
  }, [onChange])

  return (
    <Wrapper key={normalizedDefaultValue} isEmpty={!normalizedDefaultValue} noMargin={noMargin} width={width}>
      <DateRangePicker
        container={containerRef}
        defaultValue={normalizedDefaultValue}
        showOneCalendar
        placeholder={placeholder}
        cleanable
        size={'sm'}
        disabledDate={disabledDate}
        onOk={handleChange}
        onClean={handleClear}
        ranges={[]}
        format="dd-MM-yyyy"
        placement={'auto'}
        locale={DATE_RANGE_PICKER_LOCALE}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin: ${p => p.noMargin ? 0 : '12px 0 20px 20px'};
  width: ${p => p.width || 197}px;

  .rs-picker-daterange {
    background: ${p => p.isEmpty ? COLORS.gainsboro : 'transparent'};
  }
`

export default DateRange
