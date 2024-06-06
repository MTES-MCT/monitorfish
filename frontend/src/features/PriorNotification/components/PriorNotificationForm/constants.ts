import { ObjectSchema, array, boolean, number, object, string } from 'yup'

import type { FormValues } from './types'
import type { PriorNotification } from '../../PriorNotification.types'

export const BLUEFIN_TUNA_EXTENDED_SPECY_CODES = ['BF1', 'BF2', 'BF3']

const FISHING_CATCH_VALIDATION_SCHEMA: ObjectSchema<PriorNotification.PriorNotificationDataFishingCatch> = object({
  quantity: number(),
  specyCode: string().required(),
  specyName: string().required(),
  weight: number().required()
})

export const FORM_VALIDATION_SCHEMA: ObjectSchema<FormValues> = object({
  authorTrigram: string().trim().required(),
  didNotFishAfterZeroNotice: boolean().required(),
  expectedArrivalDate: string().required(),
  expectedLandingDate: string(),
  faoArea: string().required(),
  fishingCatches: array().of(FISHING_CATCH_VALIDATION_SCHEMA.required()).ensure().required().min(1),
  isExpectedLandingDateSameAsExpectedArrivalDate: boolean().required(),
  note: string(),
  portLocode: string().required(),
  sentAt: string().required(),
  tripGearCodes: array().of(string().required()).ensure().required().min(1),
  vesselId: number().required()
})

export const INITIAL_FORM_VALUES: FormValues = {
  authorTrigram: undefined,
  didNotFishAfterZeroNotice: false,
  expectedArrivalDate: undefined,
  expectedLandingDate: undefined,
  faoArea: undefined,
  fishingCatches: [],
  isExpectedLandingDateSameAsExpectedArrivalDate: false,
  note: undefined,
  portLocode: undefined,
  sentAt: undefined,
  tripGearCodes: [],
  vesselId: undefined
}
