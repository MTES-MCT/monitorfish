import React, { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { TimeRow } from '../../../commonStyles/FishingPeriod.style'
import { CustomCheckbox } from '../../../commonStyles/Backoffice.style'
import useSetFishingPeriod from '../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { FISHING_PERIOD_KEYS } from '../../../Regulation/utils'

const DayTimeCheckbox = ({ timeIsDisabled, disabled }) => {
  const { daytime } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const setDaytime = useSetFishingPeriod(FISHING_PERIOD_KEYS.DAYTIME)
  const onChange = useCallback(_ => setDaytime(!daytime), [daytime, setDaytime])

  useEffect(() => {
    if (disabled) {
      setDaytime(undefined)
    }
  }, [disabled])

  return <TimeRow disabled={timeIsDisabled}>
    Ou<Checkbox
      disabled={timeIsDisabled || disabled}
      checked={daytime}
      onChange={onChange}
    >du lever au coucher du soleil</Checkbox>
  </TimeRow>
}

const Checkbox = styled(CustomCheckbox)`
  margin-left: 5px;
`

export default DayTimeCheckbox
