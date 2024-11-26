import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { useSetFishingPeriod } from '../../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { CustomCheckbox } from '../../../../commonStyles/Backoffice.style'
import { Row } from '../../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../../commonStyles/Input.style'
import { FishingPeriodKey } from '../../../utils'

export function Always({ authorized }) {
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)
  const setAlways = useSetFishingPeriod(FishingPeriodKey.ALWAYS)
  const onChange = useCallback(
    _ => setAlways(!processingRegulation.fishingPeriod?.always),
    [setAlways, processingRegulation.fishingPeriod?.always]
  )

  useEffect(() => {
    if (authorized) {
      setAlways(undefined)
    }
  }, [authorized, setAlways])

  return (
    <>
      {!authorized ? (
        <Row>
          <Label>En tous temps</Label>
          <AlwaysCheckbox checked={!!processingRegulation.fishingPeriod?.always} onChange={onChange} />
        </Row>
      ) : null}
    </>
  )
}

const AlwaysCheckbox = styled(CustomCheckbox)`
  margin-top: 0px;
`
