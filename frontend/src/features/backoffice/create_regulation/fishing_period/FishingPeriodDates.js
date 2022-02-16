import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { Row, ContentWrapper } from '../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../commonStyles/Input.style'
import { SquareButton } from '../../../commonStyles/Buttons.style'
import { SQUARE_BUTTON_TYPE } from '../../../../constants/constants'
import { FISHING_PERIOD_KEYS } from '../../../../domain/entities/regulatory'
import usePopArrayInFishingPeriod from '../../../../hooks/usePopArrayInFishingPeriod'
import usePushArrayInFishingPeriod from '../../../../hooks/usePushArrayInFishingPeriod'
import FishingPeriodDate from './FishingPeriodDate'

const FishingPeriodDates = ({ disabled }) => {
  const { dates } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)

  const addDate = usePopArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATES, dates) // j'ai supprimé !disabled &&
  const removeDate = usePushArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATES, dates) // j'ai supprimé !disabled &&

  return <Row>
    <ContentWrapper alignSelf={'flex-start'}>
      <Label>Dates précises</Label>
    </ContentWrapper>
    <DateList>
      { dates?.length > 0
        ? dates.map((date, id) => {
          return <FishingPeriodDate
              key={date}
              date={date}
              id={id}
              disabled={disabled}
            />
        })
        : <FishingPeriodDate
            key={-1}
            date={undefined}
            id={-1}
            disabled={disabled}
          />
      }
    </DateList>
    <ContentWrapper alignSelf={'flex-end'}>
      <SquareButton
        type={SQUARE_BUTTON_TYPE.DELETE}
        disabled={disabled || !dates?.length > 0}
        onClick={addDate} />
      <SquareButton
        disabled={disabled || !dates?.length > 0}
        onClick={removeDate} />
    </ContentWrapper>
  </Row>
}

const DateList = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 10px;
`

export default FishingPeriodDates
