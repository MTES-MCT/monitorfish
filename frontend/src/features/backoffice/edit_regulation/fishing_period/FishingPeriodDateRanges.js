import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import useUpdateArrayInFishingPeriod from '../../../../hooks/fishingPeriod/useUpdateArrayInFishingPeriod'
import usePushArrayInFishingPeriod from '../../../../hooks/fishingPeriod/usePushArrayInFishingPeriod'
import usePopArrayInFishingPeriod from '../../../../hooks/fishingPeriod/usePopArrayInFishingPeriod'
import { DEFAULT_DATE_RANGE, FISHING_PERIOD_KEYS } from '../../../../domain/entities/regulation'
import { ContentWrapper, DateRanges, Row } from '../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../commonStyles/Input.style'
import { SQUARE_BUTTON_TYPE } from '../../../../constants/constants'
import DateRange from './DateRange'
import { SquareButton } from '../../../commonStyles/Buttons.style'
import useSetFishingPeriod from '../../../../hooks/fishingPeriod/useSetFishingPeriod'

const FishingPeriodDateRanges = ({ disabled }) => {
  const { annualRecurrence, dateRanges } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const updateDateRanges = useUpdateArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATE_RANGES, dateRanges)
  const addDateToDateRange = usePushArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATE_RANGES, dateRanges, DEFAULT_DATE_RANGE)
  const removeDateFromDateRange = usePopArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATE_RANGES, dateRanges)
  const setDateRange = useSetFishingPeriod(FISHING_PERIOD_KEYS.DATE_RANGES)

  useEffect(() => {
    if (disabled) {
      setDateRange([])
    }
  }, [disabled])

  return <Row>
      <ContentWrapper alignSelf={'flex-start'}>
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
      <ContentWrapper alignSelf={'flex-end'}>
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

export default FishingPeriodDateRanges
