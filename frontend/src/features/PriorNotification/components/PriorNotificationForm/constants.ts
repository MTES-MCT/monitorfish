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
  authorTrigram: string().trim().required('Veuillez indiquer votre trigramme.'),
  didNotFishAfterZeroNotice: boolean().required(),
  expectedArrivalDate: string().required("Veuillez indiquer la date d'arrivée estimée."),
  expectedLandingDate: string().when('$isExpectedLandingDateSameAsExpectedArrivalDate', {
    is: false,
    then: schema => schema.required('Veuillez indiquer la date de débarquement prévue.')
  }),
  faoArea: string().required('Veuillez indiquer la zone FAO.'),
  fishingCatches: array()
    .of(FISHING_CATCH_VALIDATION_SCHEMA.required())
    .ensure()
    .required()
    .min(1, 'Veuillez sélectionner au moins une espèce.'),
  isExpectedLandingDateSameAsExpectedArrivalDate: boolean().required(),
  note: string(),
  portLocode: string().required("Veuillez indiquer le port d'arrivée."),
  sentAt: string().required('Veuillez indiquer la date de réception du préavis.'),
  tripGearCodes: array().of(string().required()).ensure().required().min(1, 'Veuillez sélectionner au moins un engin.'),
  vesselId: number().required('Veuillez indiquer le navire concerné.')
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
