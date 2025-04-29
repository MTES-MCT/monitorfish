import { regulationActions } from '@features/Regulation/slice'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { MultiRadio } from '@mtes-mct/monitor-ui'
import styled, { css } from 'styled-components'

import { DEFAULT_FISHING_PERIOD_VALUES, FishingPeriodKey, REGULATORY_REFERENCE_KEYS } from '../../../../utils'

enum Check {
  NO = 'NO',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  YES = 'YES'
}

export function AuthorizedRadioButtonGroup() {
  const dispatch = useBackofficeAppDispatch()

  const fishingPeriod = useBackofficeAppSelector(state => state.regulation.processingRegulation.fishingPeriod)

  const isAuthorized = (function () {
    if (fishingPeriod?.authorized === true) {
      return Check.YES
    }

    if (fishingPeriod?.authorized === false) {
      return Check.NO
    }

    return Check.NOT_APPLICABLE
  })()

  const onChange = (nextIsAuthorized: Check) => {
    if (nextIsAuthorized === Check.YES) {
      dispatch(regulationActions.setFishingPeriod({ key: FishingPeriodKey.ALWAYS, value: undefined }))
    }

    if (nextIsAuthorized === Check.NOT_APPLICABLE) {
      dispatch(
        regulationActions.updateProcessingRegulationByKey({
          key: REGULATORY_REFERENCE_KEYS.FISHING_PERIOD,
          value: DEFAULT_FISHING_PERIOD_VALUES
        })
      )

      return
    }

    const nextIsAuthorizedAsBoolean = nextIsAuthorized === Check.YES
    dispatch(regulationActions.setFishingPeriod({ key: FishingPeriodKey.AUTHORIZED, value: nextIsAuthorizedAsBoolean }))
  }

  return (
    <>
      Périodes
      <StyledMultiRadio
        isInline
        isLabelHidden
        label="Périodes"
        name="fishing_period_authorized"
        onChange={nextValue => onChange(nextValue as Check)}
        options={[
          { label: 'autorisées', value: Check.YES },
          { label: 'interdites', value: Check.NO },
          { label: 'aucune', value: Check.NOT_APPLICABLE }
        ]}
        renderMenuItem={(label, value) => (
          <>
            {value === Check.YES && <GreenCircle />}
            {value === Check.NO && <RedCircle />}
            {label}
          </>
        )}
        value={isAuthorized}
      />
    </>
  )
}

const StyledMultiRadio = styled(MultiRadio)`
  margin-left: 7px;
`

const circle = css`
  display: inline-block;
  height: 10px;
  width: 10px;
  margin-right: 7px;
  border-radius: 50%;
  vertical-align: middle;
`

const GreenCircle = styled.span`
  ${circle}
  background-color: ${p => p.theme.color.mediumSeaGreen};
`

const RedCircle = styled.span`
  ${circle}
  background-color: ${p => p.theme.color.maximumRed};
`
