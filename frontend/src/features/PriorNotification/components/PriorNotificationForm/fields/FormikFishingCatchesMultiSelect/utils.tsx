import { FormikNumberInput } from '@mtes-mct/monitor-ui'

import { Double, InputRow } from './styles'
import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES, GUARANTEED_ORDERED_SPECY_CODES } from '../../constants'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

export function getFishingsCatchesExtraFields(specyCode: string, fishingsCatchesIndex: number) {
  // BFT - Bluefin Tuna => + BF1, BF2, BF3
  if (specyCode === 'BFT') {
    return (
      <>
        {BLUEFIN_TUNA_EXTENDED_SPECY_CODES.map((extendedSpecyCode, extendedIndex) => (
          <Double key={extendedSpecyCode}>
            <InputRow>
              <FormikNumberInput
                isLabelHidden
                label={`Quantité (${extendedSpecyCode})`}
                name={`fishingCatches[${fishingsCatchesIndex + extendedIndex + 1}].quantity`}
              />
              pc
            </InputRow>
            <InputRow>
              <FormikNumberInput
                isLabelHidden
                label={`Poids (${extendedSpecyCode})`}
                name={`fishingCatches[${fishingsCatchesIndex + extendedIndex + 1}].weight`}
              />
              kg
            </InputRow>
          </Double>
        ))}
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

export function sortFishingCatches(
  a: PriorNotification.PriorNotificationDataFishingCatch,
  b: PriorNotification.PriorNotificationDataFishingCatch
) {
  const orderA = GUARANTEED_ORDERED_SPECY_CODES.indexOf(a.specyCode)
  const orderB = GUARANTEED_ORDERED_SPECY_CODES.indexOf(b.specyCode)

  if (orderA === -1 && orderB === -1) {
    return 0
  }

  if (orderA === -1) {
    return 1
  }

  if (orderB === -1) {
    return -1
  }

  return orderA - orderB
}
