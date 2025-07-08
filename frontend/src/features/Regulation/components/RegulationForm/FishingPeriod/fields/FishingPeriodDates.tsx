import { SQUARE_BUTTON_TYPE } from '@constants/constants'
import { usePopArrayInFishingPeriod } from '@features/Regulation/components/RegulationForm/FishingPeriod/hooks/usePopArrayInFishingPeriod'
import { usePushArrayInFishingPeriod } from '@features/Regulation/components/RegulationForm/FishingPeriod/hooks/usePushArrayInFishingPeriod'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import styled from 'styled-components'

import { FishingPeriodDate } from './FishingPeriodDate'
import { SquareButton } from '../../../../../commonStyles/Buttons.style'
import { ContentWrapper, Row } from '../../../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../../../commonStyles/Input.style'
import { FishingPeriodKey } from '../../../../utils'

export function FishingPeriodDates({ disabled }) {
  const fishingPeriod = useBackofficeAppSelector(state => state.regulation.processingRegulation.fishingPeriod)

  const removeDate = usePopArrayInFishingPeriod(FishingPeriodKey.DATES, fishingPeriod?.dates)
  const addDate = usePushArrayInFishingPeriod(FishingPeriodKey.DATES, fishingPeriod?.dates)

  return (
    <Row>
      <ContentWrapper $alignSelf="flex-start">
        <Label>Dates précises</Label>
      </ContentWrapper>
      <DateList>
        {fishingPeriod?.dates?.map((date, id) => (
          <FishingPeriodDate date={date} disabled={disabled} id={id} />
        ))}
      </DateList>
      <ContentWrapper $alignSelf="flex-end">
        <SquareButton disabled={disabled} onClick={addDate} />
        <SquareButton disabled={disabled} onClick={removeDate} type={SQUARE_BUTTON_TYPE.DELETE} />
      </ContentWrapper>
    </Row>
  )
}

const DateList = styled.div`
  display: flex;
  flex-direction: column;
`
