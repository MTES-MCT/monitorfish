import { regulationActions } from '@features/Regulation/slice'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { Checkbox } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { TimeRow } from '../../../../../commonStyles/FishingPeriod.style'
import { FishingPeriodKey } from '../../../../utils'

export function DayTimeCheckbox({ disabled, timeIsDisabled }) {
  const dispatch = useBackofficeAppDispatch()

  const daytime = useBackofficeAppSelector(state => state.regulation.processingRegulation.fishingPeriod?.daytime)

  const onChange = () => {
    const nextDaytime = !daytime

    if (nextDaytime) {
      dispatch(regulationActions.setFishingPeriod({ key: FishingPeriodKey.TIME_INTERVALS, value: [] }))
    }

    dispatch(regulationActions.setFishingPeriod({ key: FishingPeriodKey.DAYTIME, value: nextDaytime }))
  }

  return (
    <TimeRow $disabled={timeIsDisabled}>
      Ou
      <StyledCheckbox
        checked={daytime}
        disabled={timeIsDisabled || disabled}
        label="du lever au coucher du soleil"
        name="daytime"
        onChange={onChange}
      />
    </TimeRow>
  )
}

const StyledCheckbox = styled(Checkbox)`
  margin-left: 8px;
`
