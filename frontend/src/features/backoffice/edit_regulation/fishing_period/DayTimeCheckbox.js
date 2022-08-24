import React, { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { FISHING_PERIOD_KEYS } from '../../../../domain/entities/regulatory'
import useSetFishingPeriod from '../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { CustomCheckbox } from '../../../commonStyles/Backoffice.style'
import { TimeRow } from '../../../commonStyles/FishingPeriod.style'

function DayTimeCheckbox({ disabled, timeIsDisabled }) {
  const { daytime } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const setDaytime = useSetFishingPeriod(FISHING_PERIOD_KEYS.DAYTIME)
  const onChange = useCallback(_ => setDaytime(!daytime), [daytime, setDaytime])

  useEffect(() => {
    if (disabled) {
      setDaytime(undefined)
    }
  }, [disabled])

  return (
    <TimeRow disabled={timeIsDisabled}>
      Ou
      <Checkbox checked={daytime} disabled={timeIsDisabled || disabled} onChange={onChange}>
        du lever au coucher du soleil
      </Checkbox>
    </TimeRow>
  )
}

const Checkbox = styled(CustomCheckbox)`
  margin-left: 5px;
`

export default DayTimeCheckbox
