import { ObjectSchema, array, boolean, number, object, string, mixed } from 'yup'

import { PriorNotification } from '../../PriorNotification.types'

import type { ManualPriorNotificationFormValues } from './types'

import PurposeCode = PriorNotification.PurposeCode

const FISHING_CATCH_VALIDATION_SCHEMA: ObjectSchema<PriorNotification.FormDataFishingCatch> = object({
  faoArea: string().when('$hasGlobalFaoArea', {
    is: false,
    then: schema => schema.required('Veuillez indiquer la zone FAO pour chaque espèce.')
  }),
  quantity: number(),
  specyCode: string().required(),
  specyName: string().required(),
  weight: number().required('Veuillez indiquer le poids pour chaque espèce.')
})

export const FORM_VALIDATION_SCHEMA: ObjectSchema<ManualPriorNotificationFormValues> = object({
  didNotFishAfterZeroNotice: boolean().required(),
  expectedArrivalDate: string().required("Veuillez indiquer la date d'arrivée estimée."),
  expectedLandingDate: string().when('$isExpectedLandingDateSameAsExpectedArrivalDate', {
    is: false,
    then: schema => schema.required('Veuillez indiquer la date de débarquement prévue.')
  }),
  fishingCatches: array()
    .of(FISHING_CATCH_VALIDATION_SCHEMA.required())
    .ensure()
    .required()
    .min(1, 'Veuillez sélectionner au moins une espèce.'),
  globalFaoArea: string().when('$hasGlobalFaoArea', {
    is: true,
    then: schema => schema.required('Veuillez indiquer la zone FAO.')
  }),
  hasGlobalFaoArea: boolean().required(),
  hasPortEntranceAuthorization: boolean().nonNullable().required(),
  hasPortLandingAuthorization: boolean().nonNullable().required(),
  isExpectedLandingDateSameAsExpectedArrivalDate: boolean().required(),
  note: string(),
  portLocode: string().required("Veuillez indiquer le port d'arrivée."),
  purpose: mixed<PurposeCode>()
    .oneOf(Object.values(PurposeCode) as PurposeCode[])
    .required('Veuillez indiquer la raison du préavis.'),
  sentAt: string().required('Veuillez indiquer la date de réception du préavis.'),
  tripGearCodes: array().of(string().required()).ensure().required().min(1, 'Veuillez sélectionner au moins un engin.'),
  vesselId: number().required('Veuillez indiquer le navire concerné.')
})

export const INITIAL_FORM_VALUES: ManualPriorNotificationFormValues = {
  didNotFishAfterZeroNotice: false,
  expectedArrivalDate: undefined,
  expectedLandingDate: undefined,
  fishingCatches: [],
  globalFaoArea: undefined,
  hasGlobalFaoArea: true,
  hasPortEntranceAuthorization: true,
  hasPortLandingAuthorization: true,
  isExpectedLandingDateSameAsExpectedArrivalDate: false,
  note: undefined,
  portLocode: undefined,
  purpose: PriorNotification.PurposeCode.LAN,
  sentAt: undefined,
  tripGearCodes: [],
  vesselId: undefined
}
