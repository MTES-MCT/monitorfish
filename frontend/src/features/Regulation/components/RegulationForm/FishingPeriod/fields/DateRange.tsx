import { DatePicker, getUtcizedDayjs } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { DateInterval } from '@features/Regulation/types'

type DateRangeProps = Readonly<{
  dateRange: DateInterval
  disabled: boolean
  id: number
  isLast: boolean
  updateList: (id: number, dateRange: DateInterval) => void
}>
export function DateRange({ dateRange, disabled, id, isLast, updateList }: DateRangeProps) {
  const { endDate, startDate } = dateRange

  const setDateRange = (key, value) => {
    const date = new Date(value)

    const newDateRange: DateInterval = {
      ...dateRange,
      [key]: getUtcizedDayjs(date).set('hour', 0).set('minute', 0).set('second', 0).toISOString()
    }

    updateList(id, newDateRange)
  }

  return (
    <Wrapper $disabled={disabled} $isLast={isLast}>
      <DateRangeRow>
        Du{' '}
        <StyledDatePicker
          defaultValue={startDate}
          isErrorMessageHidden
          isLabelHidden
          isStringDate
          label="Début"
          name="startDate"
          onChange={date => setDateRange('startDate', date)}
          withTime={false}
        />
        au{' '}
        <StyledDatePicker
          defaultValue={endDate}
          isErrorMessageHidden
          isLabelHidden
          isStringDate
          label="Fin"
          name="endDate"
          onChange={date => setDateRange('endDate', date)}
          withTime={false}
        />
      </DateRangeRow>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $disabled: boolean
  $isLast: boolean
}>`
  display: flex;
  flex-direction: row;
  color: #ff3392;
  opacity: ${p => (p.$disabled ? '0.4' : '1')};
  ${p => (p.$isLast ? '' : 'margin-bottom: 5px')};
`

const DateRangeRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const StyledDatePicker = styled(DatePicker)`
  margin-left: 7px;
  margin-right: 7px;
`
