import React, { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import useSetFishingPeriod from '../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { FISHING_PERIOD_KEYS } from '../../../Regulation/utils'
import { Row } from '../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../commonStyles/Input.style'
import { CustomCheckbox } from '../../../commonStyles/Backoffice.style'

const HolidayCheckbox = ({ disabled }) => {
  const { holidays } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const setHolidays = useSetFishingPeriod(FISHING_PERIOD_KEYS.HOLIDAYS)
  const onChange = useCallback(_ => setHolidays(!holidays), [setHolidays, holidays])

  useEffect(() => {
    if (disabled) {
      setHolidays(undefined)
    }
  }, [disabled])

  return <Row>
    <Label>Jours fériés</Label>
    <HolidaysCheckbox
      disabled={disabled}
      onChange={onChange}
      checked={holidays}
    />
  </Row>
}

const HolidaysCheckbox = styled(CustomCheckbox)`
  margin-top: 0px;
`

export default HolidayCheckbox
