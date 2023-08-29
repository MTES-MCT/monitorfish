import { number, object, string, addMethod } from 'yup'

import { atLeastOneRequired } from './utils/atLeastOneRequired'

addMethod(object, 'atLeastOneRequired', atLeastOneRequired)

const SilencedAlertValueSchema = object({
  type: string().required('Veuillez indiquer l’alerte suspendue.')
})

export const SilencedAlertSchema = object({
  externalReferenceNumber: string(),
  flagState: string().required('Veuillez indiquer le navire'),
  internalReferenceNumber: string(),
  ircs: string(),
  silencedBeforeDate: string().required('Veuillez indiquer la date de reprise de l’alerte'),
  value: SilencedAlertValueSchema,
  vesselId: number(),
  vesselIdentifier: string().required('Veuillez indiquer le navire'),
  vesselName: string().required('Veuillez indiquer le navire')
  // @ts-ignore
}).atLeastOneRequired(
  ['vesselId', 'internalReferenceNumber', 'externalReferenceNumber', 'ircs'],
  'Veuillez indiquer le navire'
)
