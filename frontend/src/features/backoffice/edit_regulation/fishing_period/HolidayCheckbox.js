import React, { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { FISHING_PERIOD_KEYS } from '../../../../domain/entities/regulatory'
import useSetFishingPeriod from '../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { CustomCheckbox } from '../../../commonStyles/Backoffice.style'
import { Row } from '../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../commonStyles/Input.style'

function HolidayCheckbox({ disabled }) {
  const { holidays } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const setHolidays = useSetFishingPeriod(FISHING_PERIOD_KEYS.HOLIDAYS)
  const onChange = useCallback(_ => setHolidays(!holidays), [setHolidays, holidays])

  useEffect(() => {
    if (disabled) {
      setHolidays(undefined)
    }
  }, [disabled])

  return (
    <Row>
      <Label>Jours fériés</Label>
      <HolidaysCheckbox checked={holidays} disabled={disabled} onChange={onChange} />
    </Row>
  )
}

const HolidaysCheckbox = styled(CustomCheckbox)`
  margin-top: 0px;
`

export default HolidayCheckbox
