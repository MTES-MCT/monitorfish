import { ControlUnit, getOptionsFromLabelledEnum } from '@mtes-mct/monitor-ui'
import { object, string } from 'yup'

import type { ControlUnitResourceFormValues } from './types'

export const CONTROL_UNIT_RESOURCE_FORM_SCHEMA = object().shape({
  stationId: string().required('Veuillez choisir une base.'),
  type: string().required('Veuillez choisir un type.')
})

export const CONTROL_UNIT_RESOURCE_TYPES_AS_OPTIONS = getOptionsFromLabelledEnum(
  ControlUnit.ControlUnitResourceTypeLabel,
  true
)

export const INITIAL_CONTROL_UNIT_RESOURCE_FORM_VALUES: ControlUnitResourceFormValues = {
  controlUnitId: undefined,
  isArchived: false,
  name: undefined,
  note: undefined,
  photo: undefined,
  stationId: undefined,
  type: undefined
}
