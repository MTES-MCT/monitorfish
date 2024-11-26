import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { useSetFishingPeriod } from '../../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { CustomCheckbox } from '../../../../commonStyles/Backoffice.style'
import { Row } from '../../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../../commonStyles/Input.style'
import { FishingPeriodKey } from '../../../utils'

type HolidayCheckboxProps = Readonly<{
  disabled: boolean
}>
export function HolidayCheckbox({ disabled }: HolidayCheckboxProps) {
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)
  const setHolidays = useSetFishingPeriod(FishingPeriodKey.HOLIDAYS)
  const onChange = useCallback(
    _ => setHolidays(!processingRegulation.fishingPeriod?.holidays),
    [setHolidays, processingRegulation.fishingPeriod?.holidays]
  )

  useEffect(() => {
    if (disabled) {
      setHolidays(undefined)
    }
  }, [disabled, setHolidays])

  return (
    <Row>
      <Label>Jours fériés</Label>
      <HolidaysCheckbox
        checked={!!processingRegulation.fishingPeriod?.holidays}
        disabled={disabled}
        onChange={onChange}
      />
    </Row>
  )
}

const HolidaysCheckbox = styled(CustomCheckbox)`
  margin-top: 0px;
`
