import { logSoftError } from '@mtes-mct/monitor-ui'
import { without } from 'lodash'

/**
 * Require at least one of the specified fields to be required
 * @param list - The list of fields names
 * @param message - The error message
 */
export function atLeastOneRequired(list, message) {
  // @ts-ignore
  if (!list.every(field => this.fields[field])) {
    logSoftError({
      isSideWindowError: true,
      message: 'All required fields should be defined before calling atLeastOneRequired',
      userMessage: "Une erreur est survenue la création de la suspention d'alerte"
    })
  }

  // @ts-ignore
  return this.shape(
    list.reduce(
      (acc, field) => ({
        ...acc,
        // @ts-ignore
        [field]: this.fields[field].when(without(list, field), {
          is: (...values) => !values.some(item => item),
          // @ts-ignore
          then: () => this.fields[field].required(message)
        })
      }),
      {}
    ),
    list.reduce((acc, item, idx, all) => [...acc, ...all.slice(idx + 1).map(i => [item, i])], [])
  )
}
