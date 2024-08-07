import { FormikNumberInput } from '@mtes-mct/monitor-ui'

import { Double, ExtendedSpecyCode, InputRow } from './styles'
import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES } from '../../constants'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

export function getFishingsCatchesExtraFields(
  specyCode: string,
  fishingsCatchesIndex: number,
  allFishingsCatches: PriorNotification.FormDataFishingCatch[]
) {
  // BFT - Bluefin Tuna => + BF1, BF2, BF3
  if (specyCode === 'BFT') {
    return (
      <>
        {BLUEFIN_TUNA_EXTENDED_SPECY_CODES.map(extendedSpecyCode => {
          const index = allFishingsCatches.findIndex(fishingCatch => fishingCatch.specyCode === extendedSpecyCode)

          return (
            <Double key={extendedSpecyCode}>
              <ExtendedSpecyCode>{extendedSpecyCode}</ExtendedSpecyCode>
              <InputRow>
                <FormikNumberInput
                  isLabelHidden
                  label={`Quantité (${extendedSpecyCode})`}
                  name={`fishingCatches[${index}].quantity`}
                />
                pc
              </InputRow>
              <InputRow>
                <FormikNumberInput
                  isLabelHidden
                  label={`Poids (${extendedSpecyCode})`}
                  name={`fishingCatches[${index}].weight`}
                />
                kg
              </InputRow>
            </Double>
          )
        })}
      </>
    )
  }

  // SWO - Swordfish
  if (specyCode === 'SWO') {
    return (
      <InputRow>
        <FormikNumberInput
          isLabelHidden
          label={`Quantité (${specyCode})`}
          name={`fishingCatches[${fishingsCatchesIndex}].quantity`}
        />
        pc
      </InputRow>
    )
  }

  return <></>
}
