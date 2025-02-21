import { SQUARE_BUTTON_TYPE } from '@constants/constants'
import { usePopArrayInFishingPeriod } from '@features/Regulation/components/RegulationForm/FishingPeriod/hooks/usePopArrayInFishingPeriod'
import { usePushArrayInFishingPeriod } from '@features/Regulation/components/RegulationForm/FishingPeriod/hooks/usePushArrayInFishingPeriod'
import { useUpdateArrayInFishingPeriod } from '@features/Regulation/components/RegulationForm/FishingPeriod/hooks/useUpdateArrayInFishingPeriod'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'

import { TimeInterval } from './TimeInterval'
import { SquareButton } from '../../../../../commonStyles/Buttons.style'
import { ContentWrapper, DateRanges, TimeRow } from '../../../../../commonStyles/FishingPeriod.style'
import { FishingPeriodKey } from '../../../../utils'

type FishingPeriodTimeSectionProps = Readonly<{
  disabled: boolean
  timeIsDisabled: boolean
}>
export function FishingPeriodTimeSection({ disabled, timeIsDisabled }: FishingPeriodTimeSectionProps) {
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

  return (
    <TimeRow $disabled={timeIsDisabled}>
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
      <ContentWrapper $alignSelf="flex-end">
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
