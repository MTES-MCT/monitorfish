/* eslint-disable sort-keys-fix/sort-keys-fix */

import { customDayjs } from '@mtes-mct/monitor-ui'
import { object, string } from 'yup'

export const MainFormSchema = object({
  startDateTimeUtc: string().required('La date de début de mission est un champ obligatoire.'),
  endDateTimeUtc: string().test({
    message: 'La date de fin de mission doit être postérieure à la date de début.',
    test: (endDateTimeUtc, context) =>
      context.parent.startDateTimeUtc ? customDayjs(endDateTimeUtc).isAfter(context.parent.startDateTimeUtc) : true
  })
})
