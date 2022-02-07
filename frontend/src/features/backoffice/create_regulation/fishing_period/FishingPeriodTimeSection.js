import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { TimeRow, DateRanges, ContentWrapper } from '../../../commonStyles/FishingPeriod.style'
import { SquareButton } from '../../../commonStyles/Buttons.style'
import { SQUARE_BUTTON_TYPE } from '../../../../constants/constants'
import TimeInterval from './TimeInterval'
import { FISHING_PERIOD_KEYS } from '../../../../domain/entities/regulatory'
import useUpdateArrayInFishingPeriod from '../../../../hooks/useUpdateArrayInFishingPeriod'
import usePopArrayInFishingPeriod from '../../../../hooks/usePopArrayInFishingPeriod'
import usePushArrayInFishingPeriod from '../../../../hooks/usePushArrayInFishingPeriod'
import useSetFishingPeriod from '../../../../hooks/useSetFishingPeriod'

const FishingPeriodTimeSection = ({ timeIsDisabled, disabled }) => {
  const { timeIntervals, daytime } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const onTimeIntervalChange = useUpdateArrayInFishingPeriod(FISHING_PERIOD_KEYS.TIME_INTERVALS, timeIntervals)
  const addTimeToTimeInterval = usePushArrayInFishingPeriod(FISHING_PERIOD_KEYS.TIME_INTERVALS, timeIntervals, {}) // j'ai supprimé !disabled &&
  const removeTimeFromTimeInterval = usePopArrayInFishingPeriod(FISHING_PERIOD_KEYS.TIME_INTERVALS, timeIntervals) // j'ai supprimé !disabled &&
  const setTimeInterval = useSetFishingPeriod(FISHING_PERIOD_KEYS.TIME_INTERVALS)

  useEffect(() => {
    if (daytime) {
      setTimeInterval([])
    }
  }, [setTimeInterval, daytime])

  return <TimeRow disabled={timeIsDisabled}>
    <DateRanges>
        { timeIntervals?.length > 0
          ? timeIntervals.map((timeInterval, id) => {
            return <TimeInterval
              key={timeInterval}
              id={id}
              isLast={id === timeIntervals.length - 1}
              timeInterval={timeInterval}
              disabled={timeIsDisabled || disabled || daytime}
              onTimeIntervalChange={onTimeIntervalChange}
            />
          })
          : <TimeInterval
            key={-1}
            id={-1}
            isLast
            timeInterval={undefined}
            disabled={timeIsDisabled || disabled || daytime}
            onTimeIntervalChange={onTimeIntervalChange}
          />
        }
    </DateRanges>
    <ContentWrapper alignSelf={'flex-end'}>
      <SquareButton
        disabled={timeIsDisabled || disabled || timeIntervals?.length === 0}
        onClick={addTimeToTimeInterval} />
      <SquareButton
        type={SQUARE_BUTTON_TYPE.DELETE}
        disabled={timeIsDisabled || disabled || timeIntervals?.length === 0}
        onClick={removeTimeFromTimeInterval} />
    </ContentWrapper>
  </TimeRow>
}

export default FishingPeriodTimeSection
