import { regulationActions } from '@features/Regulation/slice'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { Checkbox } from '@mtes-mct/monitor-ui'

import { Row } from '../../../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../../../commonStyles/Input.style'
import { FishingPeriodKey } from '../../../../utils'

type HolidayCheckboxProps = Readonly<{
  disabled: boolean
}>
export function HolidayCheckbox({ disabled }: HolidayCheckboxProps) {
  const dispatch = useBackofficeAppDispatch()
  const fishingPeriod = useBackofficeAppSelector(state => state.regulation.processingRegulation.fishingPeriod)

  return (
    <Row>
      <Label>Jours fériés</Label>
      <Checkbox
        checked={!!fishingPeriod?.holidays}
        data-cy="holidays-checkbox"
        disabled={disabled}
        label="Jours fériés"
        name="holidays-checkbox"
        onChange={() => {
          dispatch(
            regulationActions.setFishingPeriod({ key: FishingPeriodKey.HOLIDAYS, value: !fishingPeriod?.holidays })
          )
        }}
      />
    </Row>
  )
}
