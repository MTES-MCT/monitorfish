import { UNKNOWN_VESSEL } from '@features/Vessel/types/vessel'
import { isEqual, isEmpty } from 'lodash-es'

import type { MissionActionFormValues } from '../types'
import type { FormikErrors } from 'formik'
import type { Promisable } from 'type-fest'

export function validateBeforeOnChange(
  initialValues: MissionActionFormValues,
  validateForm: (values?: any) => Promise<FormikErrors<any>>,
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
) {
  return async nextValues => {
    const errors = await validateForm()
    const isValid = isEmpty(errors)

    // Prevent triggering `onChange` when opening the form
    if (isEqual(initialValues, nextValues)) {
      return
    }

    onChange({ ...nextValues, isValid })
  }
}

export function getVesselName(vesselName: string | undefined) {
  if (!vesselName) {
    return 'Aucun navire'
  }

  if (vesselName === UNKNOWN_VESSEL.vesselName) {
    return 'Nom inconnu'
  }

  return vesselName
}
