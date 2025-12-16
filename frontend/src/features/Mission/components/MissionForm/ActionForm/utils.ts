import { MissionAction } from '@features/Mission/missionAction.types'
import { UNKNOWN_VESSEL } from '@features/Vessel/types/vessel'
import { isEmpty, isEqual, find } from 'lodash-es'

import type { MissionActionFormValues } from '../types'
import type { Option, UndefineExcept } from '@mtes-mct/monitor-ui'
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

export function getFlatInfractionFromThreatsHierarchy(
  infraction: MissionAction.Infraction,
  natinfsAsOptions?: Option<number>[]
): UndefineExcept<MissionAction.Infraction, 'comments' | 'infractionType'> {
  const threat = infraction.threats?.[0]?.label
  const threatCharacterization = infraction.threats?.[0]?.children?.[0]?.label
  const natinf = infraction.threats?.[0]?.children?.[0]?.children?.[0]?.value

  const natinfDescription: string | undefined =
    natinf && !!natinfsAsOptions ? find(natinfsAsOptions, option => option.value === Number(natinf))?.label : undefined

  return {
    ...infraction,
    natinf: natinf ? parseInt(natinf, 10) : undefined,
    natinfDescription: natinfDescription ? natinfDescription.split(' - ')[1] : '',
    threat,
    threatCharacterization
  }
}
