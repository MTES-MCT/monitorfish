import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useEffect } from 'react'

import { TimeInterval } from './TimeInterval'
import { SQUARE_BUTTON_TYPE } from '../../../../constants/constants'
import { usePopArrayInFishingPeriod } from '../../../../hooks/fishingPeriod/usePopArrayInFishingPeriod'
import { usePushArrayInFishingPeriod } from '../../../../hooks/fishingPeriod/usePushArrayInFishingPeriod'
import { useSetFishingPeriod } from '../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { useUpdateArrayInFishingPeriod } from '../../../../hooks/fishingPeriod/useUpdateArrayInFishingPeriod'
import { SquareButton } from '../../../commonStyles/Buttons.style'
import { TimeRow, DateRanges, ContentWrapper } from '../../../commonStyles/FishingPeriod.style'
import { FishingPeriodKey } from '../../../Regulation/utils'

type FishingPeriodTimeSectionProps = Readonly<{
  disabled: boolean
  timeIsDisabled: boolean
}>
export function FishingPeriodTimeSection({ disabled, timeIsDisabled }: FishingPeriodTimeSectionProps) {
  // const { daytime, timeIntervals } = useBackofficeAppSelector(
  //   state => state.regulation.processingRegulation.fishingPeriod
  // )
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)
  const onTimeIntervalChange = useUpdateArrayInFishingPeriod(
    FishingPeriodKey.TIME_INTERVALS,
    processingRegulation.fishingPeriod?.timeIntervals
  )
  const addTimeToTimeInterval = usePushArrayInFishingPeriod(
    FishingPeriodKey.TIME_INTERVALS,
    processingRegulation.fishingPeriod?.timeIntervals,
    {}
  )
  const removeTimeFromTimeInterval = usePopArrayInFishingPeriod(
    FishingPeriodKey.TIME_INTERVALS,
    processingRegulation.fishingPeriod?.timeIntervals
  )
  const setTimeInterval = useSetFishingPeriod(FishingPeriodKey.TIME_INTERVALS)

  useEffect(() => {
    if (disabled) {
      setTimeInterval([])
    }
  }, [disabled, setTimeInterval])

  useEffect(() => {
    if (processingRegulation.fishingPeriod?.daytime) {
      setTimeInterval([])
    }
  }, [processingRegulation.fishingPeriod?.daytime, setTimeInterval])

  return (
    <TimeRow disabled={timeIsDisabled}>
      <DateRanges>
        {processingRegulation.fishingPeriod?.timeIntervals?.length === 0 && (
          <TimeInterval
            key={-1}
            disabled={timeIsDisabled || disabled || processingRegulation.fishingPeriod?.daytime}
            id={-1}
            isLast
            onTimeIntervalChange={onTimeIntervalChange}
            timeInterval={undefined}
          />
        )}
        {processingRegulation.fishingPeriod?.timeIntervals.map((timeInterval, index) => (
          <TimeInterval
            key={JSON.stringify(timeInterval)}
            disabled={timeIsDisabled || disabled || processingRegulation.fishingPeriod?.daytime}
            id={index}
            isLast={
              processingRegulation.fishingPeriod &&
              index === processingRegulation.fishingPeriod.timeIntervals.length - 1
            }
            onTimeIntervalChange={onTimeIntervalChange}
            timeInterval={timeInterval}
          />
        ))}
      </DateRanges>
      <ContentWrapper alignSelf="flex-end">
        <SquareButton
          disabled={timeIsDisabled || disabled || processingRegulation.fishingPeriod?.timeIntervals?.length === 0}
          onClick={addTimeToTimeInterval}
        />
        <SquareButton
          disabled={timeIsDisabled || disabled || processingRegulation.fishingPeriod?.timeIntervals?.length === 0}
          onClick={removeTimeFromTimeInterval}
          type={SQUARE_BUTTON_TYPE.DELETE}
        />
      </ContentWrapper>
    </TimeRow>
  )
}
