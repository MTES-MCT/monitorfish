import { logSoftError } from '@mtes-mct/monitor-ui'
import { without } from 'lodash'
import { addMethod, number, object, ObjectSchema, string } from 'yup'

import type { SilencedAlertData } from '../../../../domain/entities/alerts/types'

/**
 * Require at least one of the specified fields to be present
 * @param requiredFields - The list of fields names
 * @param message - The error message
 */
export function atLeastOneRequired(
  this: ObjectSchema<{ [key: string]: any }>,
  requiredFields: string[],
  message: string
) {
  if (!requiredFields.every(field => this.fields[field])) {
    logSoftError({
      isSideWindowError: true,
      message: 'All required fields should be defined before calling atLeastOneRequired',
      userMessage: "Une erreur est survenue lors de la création de la suspention d'alerte"
    })
  }

  return this.shape(
    requiredFields.reduce(
      (acc, field) => ({
        ...acc,
        // @ts-ignore
        [field]: this.fields[field].when(without(requiredFields, field), {
          is: (...values) => !values.some(item => item),
          // @ts-ignore
          then: () => this.fields[field].required(message)
        })
      }),
      {}
    ),
    // @ts-ignore
    requiredFields.reduce((acc, item, idx, all) => [...acc, ...all.slice(idx + 1).map(i => [item, i])], [])
  )
}

addMethod(object, 'atLeastOneRequired', atLeastOneRequired)

const SilencedAlertValueSchema = object({
  type: string().required('Veuillez indiquer l’alerte suspendue.')
})

export const SilencedAlertSchema = object<SilencedAlertData>({
  externalReferenceNumber: string(),
  flagState: string().required('Veuillez indiquer le navire'),
  internalReferenceNumber: string(),
  ircs: string(),
  silencedBeforeDate: string().required('Veuillez indiquer la date de reprise de l’alerte'),
  value: SilencedAlertValueSchema,
  vesselId: number(),
  vesselIdentifier: string().required('Veuillez indiquer le navire'),
  vesselName: string().required('Veuillez indiquer le navire')
  /**
   * It is not easy to extends Yup's ObjectSchema interface, see https://github.com/jquense/yup/issues/312
   */
  // @ts-ignore
}).atLeastOneRequired(
  ['vesselId', 'internalReferenceNumber', 'externalReferenceNumber', 'ircs'],
  'Veuillez indiquer le navire'
)
