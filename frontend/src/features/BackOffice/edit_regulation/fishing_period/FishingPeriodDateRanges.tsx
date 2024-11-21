import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useEffect } from 'react'

import { DateRange } from './DateRange'
import { SQUARE_BUTTON_TYPE } from '../../../../constants/constants'
import { usePopArrayInFishingPeriod } from '../../../../hooks/fishingPeriod/usePopArrayInFishingPeriod'
import { usePushArrayInFishingPeriod } from '../../../../hooks/fishingPeriod/usePushArrayInFishingPeriod'
import { useSetFishingPeriod } from '../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { useUpdateArrayInFishingPeriod } from '../../../../hooks/fishingPeriod/useUpdateArrayInFishingPeriod'
import { SquareButton } from '../../../commonStyles/Buttons.style'
import { ContentWrapper, DateRanges, Row } from '../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../commonStyles/Input.style'
import { DEFAULT_DATE_RANGE, FishingPeriodKey } from '../../../Regulation/utils'

import type { DateInterval } from '@features/Regulation/types'

type FishingPeriodDateRangesProps = Readonly<{
  disabled: boolean
}>
export function FishingPeriodDateRanges({ disabled }: FishingPeriodDateRangesProps) {
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)
  // const { annualRecurrence, dateRanges } = useBackofficeAppSelector(
  //   state => state.regulation.processingRegulation.fishingPeriod
  // )
  const updateDateRanges = useUpdateArrayInFishingPeriod<DateInterval>(
    FishingPeriodKey.DATE_RANGES,
    processingRegulation.fishingPeriod?.dateRanges
  )
  const addDateToDateRange = usePushArrayInFishingPeriod(
    FishingPeriodKey.DATE_RANGES,
    processingRegulation.fishingPeriod?.dateRanges,
    DEFAULT_DATE_RANGE
  )
  const removeDateFromDateRange = usePopArrayInFishingPeriod(
    FishingPeriodKey.DATE_RANGES,
    processingRegulation.fishingPeriod?.dateRanges
  )
  const setDateRange = useSetFishingPeriod(FishingPeriodKey.DATE_RANGES)

  const { fishingPeriod } = processingRegulation

  useEffect(() => {
    if (disabled) {
      setDateRange([])
    }
  }, [disabled, setDateRange])

  return (
    <Row>
      <ContentWrapper alignSelf="flex-start">
        <Label>Plages de dates</Label>
      </ContentWrapper>
      <DateRanges>
        {fishingPeriod?.dateRanges && fishingPeriod.dateRanges.length > 0 ? (
          fishingPeriod?.dateRanges.map((dateRange, id) => (
            <DateRange
              key={JSON.stringify(dateRange)}
              dateRange={dateRange}
              disabled={disabled}
              id={id}
              isLast={id === fishingPeriod.dateRanges.length - 1}
              updateList={updateDateRanges}
            />
          ))
        ) : (
          <DateRange
            key={-1}
            dateRange={DEFAULT_DATE_RANGE}
            disabled={disabled}
            id={-1}
            isLast
            updateList={updateDateRanges}
          />
        )}
      </DateRanges>
      <ContentWrapper alignSelf="flex-end">
        <SquareButton disabled={disabled || fishingPeriod?.dateRanges?.length === 0} onClick={addDateToDateRange} />
        <SquareButton
          disabled={disabled || fishingPeriod?.dateRanges?.length === 0}
          onClick={removeDateFromDateRange}
          type={SQUARE_BUTTON_TYPE.DELETE}
        />
      </ContentWrapper>
    </Row>
  )
}
