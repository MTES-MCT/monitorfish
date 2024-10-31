import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useEffect } from 'react'
import styled from 'styled-components'

import { FishingPeriodDate } from './FishingPeriodDate'
import { SQUARE_BUTTON_TYPE } from '../../../../constants/constants'
import { usePopArrayInFishingPeriod } from '../../../../hooks/fishingPeriod/usePopArrayInFishingPeriod'
import { usePushArrayInFishingPeriod } from '../../../../hooks/fishingPeriod/usePushArrayInFishingPeriod'
import { useSetFishingPeriod } from '../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { SquareButton } from '../../../commonStyles/Buttons.style'
import { ContentWrapper, Row } from '../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../commonStyles/Input.style'
import { FISHING_PERIOD_KEYS } from '../../../Regulation/utils'

export function FishingPeriodDates({ disabled }) {
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)

  const addDate = usePopArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATES, processingRegulation.fishingPeriod?.dates)
  const removeDate = usePushArrayInFishingPeriod(FISHING_PERIOD_KEYS.DATES, processingRegulation.fishingPeriod?.dates)
  const setDates = useSetFishingPeriod(FISHING_PERIOD_KEYS.DATES)

  useEffect(() => {
    if (disabled) {
      setDates([])
    }
  }, [disabled, setDates])

  return (
    <Row>
      <ContentWrapper alignSelf="flex-start">
        <Label>Dates précises</Label>
      </ContentWrapper>
      <DateList>
        {processingRegulation.fishingPeriod?.dates && processingRegulation.fishingPeriod?.dates?.length > 0 && (
          <>
            {processingRegulation.fishingPeriod?.dates.map((date, id) => (
              <FishingPeriodDate key={date} date={date} disabled={disabled} id={id} />
            ))}
            <FishingPeriodDate key={-1} date={undefined} disabled={disabled} id={-1} />
          </>
        )}
      </DateList>
      <ContentWrapper alignSelf="flex-end">
        <SquareButton disabled={disabled} onClick={addDate} type={SQUARE_BUTTON_TYPE.DELETE} />
        <SquareButton disabled={disabled} onClick={removeDate} />
      </ContentWrapper>
    </Row>
  )
}

const DateList = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 10px;
`
