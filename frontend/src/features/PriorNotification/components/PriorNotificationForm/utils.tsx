import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES, INITIAL_FORM_VALUES } from './constants'

import type { FormValues } from './types'
import type { PriorNotification } from '../../PriorNotification.types'

export function getInitialFormValues(): FormValues {
  return {
    ...INITIAL_FORM_VALUES,
    sentAt: new Date().toISOString()
  }
}

export function getFishingsCatchesInitialValues(
  specyCode: string,
  specyName: string
): PriorNotification.PriorNotificationDataFishingCatch[] {
  switch (specyCode) {
    case 'BFT':
      return [
        {
          quantity: undefined,
          specyCode: 'BFT',
          specyName,
          weight: 0
        },
        ...BLUEFIN_TUNA_EXTENDED_SPECY_CODES.map(extendedSpecyCode => ({
          quantity: 0,
          specyCode: extendedSpecyCode,
          specyName,
          weight: 0
        }))
      ]

    case 'SWO':
      return [
        {
          quantity: 0,
          specyCode: 'SWO',
          specyName,
          weight: 0
        }
      ]

    default:
      return [
        {
          quantity: undefined,
          specyCode,
          specyName,
          weight: 0
        }
      ]
  }
}

export function isZeroNotice(formValues: FormValues) {
  return formValues.fishingCatches.every(fishingCatch => fishingCatch.weight === 0)
}
