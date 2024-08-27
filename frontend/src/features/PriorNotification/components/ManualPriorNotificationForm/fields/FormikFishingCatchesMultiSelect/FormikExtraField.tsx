import { FormikNumberInput } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { InputWithUnit, SubRow } from './styles'
import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES } from '../../constants'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

type FormikExtraFieldProps = Readonly<{
  allFishingsCatches: PriorNotification.FormDataFishingCatch[]
  fishingsCatchesIndex: number
  specyCode: string
}>
export function FormikExtraField({ allFishingsCatches, fishingsCatchesIndex, specyCode }: FormikExtraFieldProps) {
  // BFT - Bluefin Tuna => + BF1, BF2, BF3
  if (specyCode === 'BFT') {
    return (
      <>
        {BLUEFIN_TUNA_EXTENDED_SPECY_CODES.map(extendedSpecyCode => {
          const index = allFishingsCatches.findIndex(fishingCatch => fishingCatch.specyCode === extendedSpecyCode)

          return (
            <StyledSubRow key={extendedSpecyCode}>
              <ExtendedSpecyCode>{extendedSpecyCode}</ExtendedSpecyCode>
              <InputWithUnit>
                <FormikNumberInput
                  isErrorMessageHidden
                  isLabelHidden
                  label={`Quantité (${extendedSpecyCode})`}
                  name={`fishingCatches[${index}].quantity`}
                />
                pc
              </InputWithUnit>
              <InputWithUnit>
                <FormikNumberInput
                  isErrorMessageHidden
                  isLabelHidden
                  label={`Poids (${extendedSpecyCode})`}
                  name={`fishingCatches[${index}].weight`}
                />
                kg
              </InputWithUnit>
            </StyledSubRow>
          )
        })}
      </>
    )
  }

  // SWO - Swordfish
  if (specyCode === 'SWO') {
    return (
      <StyledSubRow key="SWO">
        <InputWithUnit>
          <FormikNumberInput
            isLabelHidden
            label={`Quantité (${specyCode})`}
            name={`fishingCatches[${fishingsCatchesIndex}].quantity`}
          />
          pc
        </InputWithUnit>
      </StyledSubRow>
    )
  }

  return <></>
}

const StyledSubRow = styled(SubRow)`
  align-items: center;
  justify-content: flex-end;
`

const ExtendedSpecyCode = styled.span`
  color: ${p => p.theme.color.slateGray};
`
