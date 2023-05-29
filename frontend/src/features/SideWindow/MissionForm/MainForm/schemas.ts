/* eslint-disable sort-keys-fix/sort-keys-fix */

import { customDayjs } from '@mtes-mct/monitor-ui'
import { identity } from 'lodash/fp'
import { object, string } from 'yup'

export const MainFormSchema = object({
  startDateTimeUtc: string().required('La date de début de mission est un champ obligatoire.'),
  endDateTimeUtc: string().when('startDateTimeUtc', {
    // When `startDateTimeUtc` is defined
    is: (startDateTimeUtc: string) => !!startDateTimeUtc,
    // `endDateTimeUtc` should be after `startDateTimeUtc`
    then: schema =>
      schema.test({
        message: 'La date de fin de mission doit être postérieure à la date de début.',
        test: (endDateTimeUtc, context) => customDayjs(endDateTimeUtc).isAfter(context.parent.startDateTimeUtc)
      }),
    otherwise: identity
  })
})
