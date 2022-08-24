import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

import usePopArrayInFishingPeriod from '../../../../hooks/fishingPeriod/usePopArrayInFishingPeriod'
import usePushArrayInFishingPeriod from '../../../../hooks/fishingPeriod/usePushArrayInFishingPeriod'
import useUpdateArrayInFishingPeriod from '../../../../hooks/fishingPeriod/useUpdateArrayInFishingPeriod'
import { DEFAULT_DATE_RANGE, FISHING_PERIOD_KEYS } from '../../../../domain/entities/regulatory'
import { SquareButton } from '../../../commonStyles/Buttons.style'
import { ContentWrapper, DateRanges, Row } from '../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../commonStyles/Input.style'
import { SQUARE_BUTTON_TYPE } from '../../../../constants/constants'
import DateRange from './DateRange'
import useSetFishingPeriod from '../../../../hooks/fishingPeriod/useSetFishingPeriod'

function FishingPeriodDateRanges({ disabled }) {
  const { annualRecurrence, dateRanges } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const updateDateRanges = useUpdateArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATE_RANGES, dateRanges)
  const addDateToDateRange = usePushArrayInFishingPeriod(
    FISHING_PERIOD_KEYS.DATE_RANGES,
    dateRanges,
    DEFAULT_DATE_RANGE,
  )
  const removeDateFromDateRange = usePopArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATE_RANGES, dateRanges)
  const setDateRange = useSetFishingPeriod(FISHING_PERIOD_KEYS.DATE_RANGES)

  useEffect(() => {
    if (disabled) {
      setDateRange([])
    }
  }, [disabled])

  return (
    <Row>
      <ContentWrapper alignSelf="flex-start">
        <Label>Plages de dates</Label>
      </ContentWrapper>
      <DateRanges>
        {dateRanges?.length > 0 ? (
          dateRanges.map((dateRange, id) => <DateRange
                key={dateRange}
                id={id}
                annualRecurrence={annualRecurrence}
                dateRange={dateRange}
                updateList={updateDateRanges}
                disabled={disabled}
                isLast={id === dateRanges.length - 1}
              />)
          })
        ) : (
          <DateRange
            key={-1}
            annualRecurrence={annualRecurrence}
            dateRange={DEFAULT_DATE_RANGE}
            disabled={disabled}
            id={-1}
            isLast
            updateList={updateDateRanges}
          />
        )}
      </DateRanges>
      <ContentWrapper alignSelf="flex-end">
        <SquareButton disabled={disabled || dateRanges?.length === 0} onClick={addDateToDateRange} />
        <SquareButton
          disabled={disabled || dateRanges?.length === 0}
          onClick={removeDateFromDateRange}
          type={SQUARE_BUTTON_TYPE.DELETE} />
      </ContentWrapper>
    </Row>
  )
}

export default FishingPeriodDateRanges
