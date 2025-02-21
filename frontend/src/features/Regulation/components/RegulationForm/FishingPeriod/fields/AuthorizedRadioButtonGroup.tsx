import { regulationActions } from '@features/Regulation/slice'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { MultiRadio } from '@mtes-mct/monitor-ui'
import styled, { css } from 'styled-components'

import { FishingPeriodKey } from '../../../../utils'

export function AuthorizedRadioButtonGroup() {
  const dispatch = useBackofficeAppDispatch()

  const fishingPeriod = useBackofficeAppSelector(state => state.regulation.processingRegulation.fishingPeriod)

  const onChange = isAuthorized => {
    if (isAuthorized) {
      dispatch(regulationActions.setFishingPeriod({ key: FishingPeriodKey.ALWAYS, value: undefined }))
    }

    dispatch(regulationActions.setFishingPeriod({ key: FishingPeriodKey.AUTHORIZED, value: isAuthorized }))
  }

  return (
    <>
      Périodes
      <StyledMultiRadio
        isInline
        isLabelHidden
        label="Périodes"
        name="fishing_period_authorized"
        onChange={onChange}
        options={[
          { label: 'autorisées', value: true },
          { label: 'interdites', value: false }
        ]}
        renderMenuItem={(label, value) => (
          <>
            {value ? <GreenCircle /> : <RedCircle />}
            {label}
          </>
        )}
        value={fishingPeriod?.authorized}
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
