import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import useUpdateArrayInFishingPeriod from '../../../../hooks/useUpdateArrayInFishingPeriod'
import usePushArrayInFishingPeriod from '../../../../hooks/usePushArrayInFishingPeriod'
import usePopArrayInFishingPeriod from '../../../../hooks/usePopArrayInFishingPeriod'
import { FISHING_PERIOD_KEYS, DEFAULT_DATE_RANGE } from '../../../../domain/entities/regulatory'
import { Row, DateRanges } from '../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../commonStyles/Input.style'
import { SQUARE_BUTTON_TYPE } from '../../../../constants/constants'
import DateRange from './DateRange'
import { SquareButton } from '../../../commonStyles/Buttons.style'

const FishingPeriodDateRanges = ({ disabled }) => {
  const { annualRecurrence, dateRanges } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const updateDateRanges = useUpdateArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATE_RANGES, dateRanges)
  const addDateToDateRange = usePushArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATE_RANGES, dateRanges, DEFAULT_DATE_RANGE)
  const removeDateFromDateRange = usePopArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATE_RANGES, dateRanges)

  return <Row>
      <ContentWrapper>
        <Label>Plages de dates</Label>
      </ContentWrapper>
      <DateRanges>
        { dateRanges?.length > 0
          ? dateRanges.map((dateRange, id) => {
            return <DateRange
                key={dateRange}
                id={id}
                annualRecurrence={annualRecurrence}
                dateRange={dateRange}
                updateList={updateDateRanges}
                disabled={disabled}
                isLast={id === dateRanges.length - 1}
              />
          })
          : <DateRange
            key={-1}
            id={-1}
            isLast
            annualRecurrence={annualRecurrence}
            dateRange={DEFAULT_DATE_RANGE}
            updateList={updateDateRanges}
            disabled={disabled}
          />
        }
      </DateRanges>
      <ContentWrapper alignItems={'flex-end'}>
        <SquareButton
          disabled={disabled || dateRanges?.length === 0}
          onClick={addDateToDateRange} />
        <SquareButton
          disabled={disabled || dateRanges?.length === 0}
          type={SQUARE_BUTTON_TYPE.DELETE}
          onClick={removeDateFromDateRange} />
      </ContentWrapper>
    </Row>
}

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  ${props => props.alignItems ? `align-items: ${props.alignItems}` : ''};
`

export default FishingPeriodDateRanges
