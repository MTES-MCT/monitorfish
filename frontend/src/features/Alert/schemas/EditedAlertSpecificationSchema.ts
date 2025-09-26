import { AlertSpecificationSchema } from '@features/Alert/schemas/AlertSpecificationSchema'

export const EditedAlertSpecificationSchema = AlertSpecificationSchema.omit({
  createdAtUtc: true,
  createdBy: true,
  errorReason: true,
  hasAutomaticArchiving: true,
  isActivated: true,
  isInError: true,
  isUserDefined: true,
  vessels: true
})
