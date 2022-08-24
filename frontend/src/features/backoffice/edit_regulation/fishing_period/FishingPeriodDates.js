import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { SquareButton } from '../../../commonStyles/Buttons.style'
import { SQUARE_BUTTON_TYPE } from '../../../../constants/constants'
import { FISHING_PERIOD_KEYS } from '../../../../domain/entities/regulatory'
import usePopArrayInFishingPeriod from '../../../../hooks/fishingPeriod/usePopArrayInFishingPeriod'
import usePushArrayInFishingPeriod from '../../../../hooks/fishingPeriod/usePushArrayInFishingPeriod'
import FishingPeriodDate from './FishingPeriodDate'
import useSetFishingPeriod from '../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { ContentWrapper, Row } from '../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../commonStyles/Input.style'

function FishingPeriodDates({ disabled }) {
  const { dates } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)

  const addDate = usePopArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATES, dates)
  const removeDate = usePushArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATES, dates)
  const setDates = useSetFishingPeriod(FISHING_PERIOD_KEYS.DATES)

  useEffect(() => {
    if (disabled) {
      setDates([])
    }
  }, [disabled])

  return (
    <Row>
      <ContentWrapper alignSelf="flex-start">
        <Label>Dates précises</Label>
      </ContentWrapper>
      <DateList>
        {dates?.length > 0 ? (
          dates.map((date, id) => <FishingPeriodDate
              key={date}
              date={date}
              id={id}
              disabled={disabled}
            />)
          <FishingPeriodDate key={-1} date={undefined} id={-1} disabled={disabled} />
        )}
      </DateList>
      <ContentWrapper alignSelf="flex-end">
        <SquareButton type={SQUARE_BUTTON_TYPE.DELETE} disabled={disabled || !dates?.length > 0} onClick={addDate} />
        <SquareButton disabled={disabled || !dates?.length > 0} onClick={removeDate} />
      </ContentWrapper>
    </Row>
  )
}

const DateList = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 10px;
`

export default FishingPeriodDates
