/* eslint-disable sort-keys-fix/sort-keys-fix */

import { customDayjs } from '@mtes-mct/monitor-ui'
import { array, object, string } from 'yup'

const ControlUnitSchema = object({
  id: string().required('L’ID est obligatoire.'),
  administration: string().required('L’administration est obligatoire.'),
  name: string().required('L’unité est obligatoire.')
})

export const MainFormLiveSchema = object({
  startDateTimeUtc: string().required('La date de début de mission est obligatoire.'),
  endDateTimeUtc: string().test({
    message: 'La date de fin de mission doit être postérieure à la date de début.',
    test: (endDateTimeUtc, context) =>
      context.parent.startDateTimeUtc ? customDayjs(endDateTimeUtc).isAfter(context.parent.startDateTimeUtc) : true
  }),
  controlUnits: array(ControlUnitSchema)
    .required()
    .min(1, 'Au moins une unité de contrôle doit être attachée à la mission.')
})
