import React, { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { FISHING_PERIOD_KEYS } from '../../../../domain/entities/regulatory'
import useSetFishingPeriod from '../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { CustomCheckbox } from '../../../commonStyles/Backoffice.style'
import { Row } from '../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../commonStyles/Input.style'

function Always({ authorized }) {
  const { always } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const setAlways = useSetFishingPeriod(FISHING_PERIOD_KEYS.ALWAYS)
  const onChange = useCallback(_ => setAlways(!always), [setAlways, always])

  useEffect(() => {
    if (authorized) {
      setAlways(undefined)
    }
  }, [authorized])

  return (
    <>
      {!authorized ? (
        <Row>
          <Label>En tous temps</Label>
          <AlwaysCheckbox checked={always} onChange={onChange} />
        </Row>
      ) : null}
    </>
  )
}

const AlwaysCheckbox = styled(CustomCheckbox)`
  margin-top: 0px;
`

export default Always
