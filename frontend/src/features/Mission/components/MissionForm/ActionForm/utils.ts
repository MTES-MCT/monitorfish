import { logSoftError } from '@mtes-mct/monitor-ui'
import { isEqual, isEmpty } from 'lodash-es'

import { UNKNOWN_VESSEL } from '../../../../../domain/entities/vessel/vessel'

import type { MissionActionFormValues } from '../types'
import type { FormikErrors } from 'formik'
import type { Promisable } from 'type-fest'

export function getInitialMissionActionFormValues(
  actions: MissionActionFormValues[] | undefined = [],
  editedDraftActionIndex: number | undefined = undefined
): MissionActionFormValues | undefined {
  if (editedDraftActionIndex === undefined) {
    return undefined
  }

  const missionActionFormValues = actions[editedDraftActionIndex]
  if (!missionActionFormValues) {
    logSoftError({
      context: {
        actions,
        editedDraftActionIndex
      },
      isSideWindowError: true,
      message: '`missionActionFormValues` is undefined.',
      userMessage: "Une erreur est survenue pendant l'initialisation de la mission."
    })

    return undefined
  }

  return missionActionFormValues
}

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
