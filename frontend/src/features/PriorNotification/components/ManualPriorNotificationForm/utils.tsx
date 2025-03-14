import {
  BLUEFIN_TUNA_NAME_FR_SIZE_1,
  BLUEFIN_TUNA_NAME_FR_SIZE_2,
  BLUEFIN_TUNA_NAME_FR_SIZE_3,
  BLUEFIN_TUNA_SPECY_CODE,
  SWORDFISH_SPECY_CODE
} from '@features/PriorNotification/constants'
import { customDayjs } from '@mtes-mct/monitor-ui'

import { INITIAL_FORM_VALUES } from './constants'

import type { ManualPriorNotificationFormValues, ManualPriorNotificationFormValuesFishingCatch } from './types'

export function getPartialComputationRequestData({
  expectedArrivalDate,
  expectedLandingDate,
  fishingCatches,
  globalFaoArea,
  isExpectedLandingDateSameAsExpectedArrivalDate,
  portLocode,
  tripGearCodes,
  vesselIdentity
}: ManualPriorNotificationFormValues) {
  const computedExpectedLandingDate = isExpectedLandingDateSameAsExpectedArrivalDate
    ? expectedArrivalDate
    : expectedLandingDate
  const year = computedExpectedLandingDate ? customDayjs(computedExpectedLandingDate).get('year') : undefined

  return {
    fishingCatches,
    globalFaoArea,
    portLocode,
    tripGearCodes,
    vesselId: vesselIdentity?.vesselId,
    year
  }
}

export function getFishingsCatchesInitialValues(
  specyCode: string,
  specyName: string
): ManualPriorNotificationFormValuesFishingCatch {
  switch (specyCode) {
    case 'BFT':
      return {
        $bluefinTunaExtendedCatch: {
          BF1: {
            quantity: 0,
            specyName: BLUEFIN_TUNA_NAME_FR_SIZE_1,
            weight: 0
          },
          BF2: {
            quantity: 0,
            specyName: BLUEFIN_TUNA_NAME_FR_SIZE_2,
            weight: 0
          },
          BF3: {
            quantity: 0,
            specyName: BLUEFIN_TUNA_NAME_FR_SIZE_3,
            weight: 0
          }
        },
        quantity: undefined,
        specyCode: BLUEFIN_TUNA_SPECY_CODE,
        specyName,
        weight: 0
      }

    case 'SWO':
      return {
        quantity: 0,
        specyCode: SWORDFISH_SPECY_CODE,
        specyName,
        weight: 0
      }

    default:
      return {
        quantity: undefined,
        specyCode,
        specyName,
        weight: 0
      }
  }
}

export function getInitialFormValues(): ManualPriorNotificationFormValues {
  return {
    ...INITIAL_FORM_VALUES,
    sentAt: new Date().toISOString()
  }
}
