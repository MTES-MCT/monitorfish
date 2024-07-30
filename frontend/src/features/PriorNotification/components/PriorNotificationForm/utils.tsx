import { pick } from 'lodash'

import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES, INITIAL_FORM_VALUES } from './constants'
import { PriorNotification } from '../../PriorNotification.types'

import type { FormValues } from './types'

export function getPartialComputationRequestData(formValues: FormValues) {
  return pick(formValues, ['faoArea', 'fishingCatches', 'portLocode', 'tripGearCodes', 'vesselId'])
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

export function getInitialFormValues(): FormValues {
  return {
    ...INITIAL_FORM_VALUES,
    sentAt: new Date().toISOString()
  }
}
