/* eslint-disable sort-keys-fix/sort-keys-fix */

import { HIDDEN_ERROR } from '@features/Mission/components/MissionForm/constants'
import { customDayjs } from '@mtes-mct/monitor-ui'
import { array, object, string } from 'yup'

const ControlUnitSchema = object({
  id: string().required(HIDDEN_ERROR),
  administration: string().required(HIDDEN_ERROR),
  name: string().required(HIDDEN_ERROR)
})

export const MainFormLiveSchema = object({
  startDateTimeUtc: string().required(HIDDEN_ERROR),
  missionTypes: array().min(1).required(HIDDEN_ERROR),
  endDateTimeUtc: string()
    .required(HIDDEN_ERROR)
    .test({
      message: 'La date de fin de mission doit être postérieure à la date de début.',
      test: (endDateTimeUtc, context) =>
        context.parent.startDateTimeUtc ? customDayjs(endDateTimeUtc).isAfter(context.parent.startDateTimeUtc) : true
    }),
  controlUnits: array(ControlUnitSchema)
    .required(HIDDEN_ERROR)
    .min(1, 'Au moins une unité de contrôle doit être attachée à la mission.')
})
