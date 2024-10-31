import { useCallback } from 'react'
import styled from 'styled-components'

import { CustomDatePicker } from '../custom_form/CustomDatePicker'

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

  const setDateRange = useCallback(
    key => value => {
      const newDateRange: DateInterval = {
        ...dateRange,
        [key]: value
      }

      updateList(id, newDateRange)
    },
    [dateRange, id, updateList]
  )

  const setEndDate = setDateRange('endDate')
  const setStartDate = setDateRange('startDate')

  return (
    <Wrapper $disabled={disabled} $isLast={isLast}>
      <DateRangeRow>
        Du{' '}
        <CustomDatePicker
          disabled={disabled}
          format="dd/MM/yyyy"
          oneTap
          placement="rightStart"
          saveValue={setStartDate}
          style={{ margin: '0px 5px' }}
          value={startDate}
        />
        au{' '}
        <CustomDatePicker
          disabled={disabled}
          format="dd/MM/yyyy"
          oneTap
          placement="rightStart"
          saveValue={setEndDate}
          style={{ margin: '0px 0px 0px 5px' }}
          value={endDate}
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
  color: ${p => p.theme.color.slateGray};
  opacity: ${p => (p.$disabled ? '0.4' : '1')};
  ${p => (p.$isLast ? '' : 'margin-bottom: 5px')};
`

const DateRangeRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`
