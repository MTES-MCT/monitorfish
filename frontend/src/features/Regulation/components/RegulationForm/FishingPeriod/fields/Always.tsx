import { regulationActions } from '@features/Regulation/slice'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { Checkbox } from '@mtes-mct/monitor-ui'

import { Row } from '../../../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../../../commonStyles/Input.style'
import { FishingPeriodKey } from '../../../../utils'

export function Always() {
  const dispatch = useBackofficeAppDispatch()

  const fishingPeriod = useBackofficeAppSelector(state => state.regulation.processingRegulation.fishingPeriod)

  const onChange = () => {
    const nextValue = !fishingPeriod?.always

    if (nextValue) {
      dispatch(
        regulationActions.setFishingPeriod({
          key: FishingPeriodKey.DATE_RANGES,
          value: []
        })
      )
      dispatch(
        regulationActions.setFishingPeriod({
          key: FishingPeriodKey.DATES,
          value: []
        })
      )
      dispatch(
        regulationActions.setFishingPeriod({
          key: FishingPeriodKey.WEEKDAYS,
          value: []
        })
      )
      dispatch(regulationActions.setFishingPeriod({ key: FishingPeriodKey.ANNUAL_RECURRENCE, value: undefined }))
      dispatch(regulationActions.setFishingPeriod({ key: FishingPeriodKey.DAYTIME, value: undefined }))
      dispatch(regulationActions.setFishingPeriod({ key: FishingPeriodKey.TIME_INTERVALS, value: [] }))
      dispatch(regulationActions.setFishingPeriod({ key: FishingPeriodKey.HOLIDAYS, value: undefined }))
    }

    dispatch(regulationActions.setFishingPeriod({ key: FishingPeriodKey.ALWAYS, value: nextValue }))
  }

  return (
    <>
      {!fishingPeriod?.authorized && (
        <Row>
          <Label>En tous temps</Label>
          <Checkbox checked={!!fishingPeriod?.always} label="En tous temps" name="always" onChange={onChange} />
        </Row>
      )}
    </>
  )
}
