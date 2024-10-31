import React, { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import useSetFishingPeriod from '../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { FISHING_PERIOD_KEYS } from '../../../Regulation/utils'
import { Row } from '../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../commonStyles/Input.style'
import { CustomCheckbox } from '../../../commonStyles/Backoffice.style'

const Always = ({ authorized }) => {
  const { always } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const setAlways = useSetFishingPeriod(FISHING_PERIOD_KEYS.ALWAYS)
  const onChange = useCallback(_ => setAlways(!always), [setAlways, always])

  useEffect(() => {
    if (authorized) {
      setAlways(undefined)
    }
  }, [authorized])

  return <>
    {
      !authorized
        ? <Row>
          <Label>En tous temps</Label>
          <AlwaysCheckbox
            onChange={onChange}
            checked={always}
          />
        </Row>
        : null
    }
  </>
}

const AlwaysCheckbox = styled(CustomCheckbox)`
  margin-top: 0px;
`

export default Always
