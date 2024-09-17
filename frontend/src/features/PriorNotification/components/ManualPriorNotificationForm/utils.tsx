import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES } from '@features/PriorNotification/constants'
import { pick } from 'lodash'

import { INITIAL_FORM_VALUES } from './constants'
import { PriorNotification } from '../../PriorNotification.types'

import type { ManualPriorNotificationFormValues } from './types'

export function getPartialComputationRequestData(formValues: ManualPriorNotificationFormValues) {
  return pick(formValues, ['fishingCatches', 'globalFaoArea', 'portLocode', 'tripGearCodes', 'vesselId'])
}

export function getFishingsCatchesInitialValues(
  specyCode: string,
  specyName: string
): PriorNotification.FormDataFishingCatch[] {
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

export function getInitialFormValues(): ManualPriorNotificationFormValues {
  return {
    ...INITIAL_FORM_VALUES,
    sentAt: new Date().toISOString()
  }
}
