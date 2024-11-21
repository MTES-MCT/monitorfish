import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { Checkbox } from '@mtes-mct/monitor-ui'
import { useEffect } from 'react'
import styled from 'styled-components'

import { useSetFishingPeriod } from '../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { TimeRow } from '../../../commonStyles/FishingPeriod.style'
import { FishingPeriodKey } from '../../../Regulation/utils'

export function DayTimeCheckbox({ disabled, timeIsDisabled }) {
  const daytime = useBackofficeAppSelector(state => state.regulation.processingRegulation.fishingPeriod?.daytime)
  const setDaytime = useSetFishingPeriod(FishingPeriodKey.DAYTIME)

  useEffect(() => {
    if (disabled) {
      setDaytime(undefined)
    }
  }, [disabled, setDaytime])

  return (
    <TimeRow disabled={timeIsDisabled}>
      Ou
      <StyledCheckbox
        checked={daytime}
        disabled={timeIsDisabled || disabled}
        label="du lever au coucher du soleil"
        name="daytime"
        onChange={() => setDaytime(!daytime)}
      />
    </TimeRow>
  )
}

const StyledCheckbox = styled(Checkbox)`
  margin-left: 8px;
`
