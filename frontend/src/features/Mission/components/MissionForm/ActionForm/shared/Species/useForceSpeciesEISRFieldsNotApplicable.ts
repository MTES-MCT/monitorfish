import { MissionAction } from '@features/Mission/missionAction.types'
import { useFormikContext } from 'formik'
import { useEffect, useRef } from 'react'

import { getApplicabilityByFieldName } from './getSpeciesEISRApplicability'

import type { SpeciesEISRApplicability } from './getSpeciesEISRApplicability'
import type { MissionActionFormValues } from '../../../types'

// FormikGangwayField.tsx's GANGWAY_DEPENDENT_FIELDS effect targets these same three fields for a
// different reason (unit not boarded) — its NOT_APPLICABLE always takes precedence, so this
// effect never resets a field away from NOT_APPLICABLE while the unit hasn't boarded.
//
// On an already applicable field, a N/A is the user's own answer: it must survive the form being reopened.
export function useForceSpeciesEISRFieldsNotApplicable(
  isEISREnabled: boolean,
  applicability: SpeciesEISRApplicability,
  isApplicabilityResolved: boolean
): void {
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()
  const previousApplicabilityByFieldName = useRef<Record<string, boolean> | undefined>(undefined)

  useEffect(() => {
    if (!isEISREnabled || !isApplicabilityResolved) {
      return
    }

    const applicabilityByFieldName = getApplicabilityByFieldName(applicability)
    const previous = previousApplicabilityByFieldName.current
    previousApplicabilityByFieldName.current = applicabilityByFieldName

    Object.entries(applicabilityByFieldName).forEach(([field, isApplicable]) => {
      const currentValue = values[field as keyof MissionActionFormValues]

      if (!isApplicable && currentValue !== MissionAction.ControlCheck.NOT_APPLICABLE) {
        void setFieldValue(field, MissionAction.ControlCheck.NOT_APPLICABLE)
      } else if (
        isApplicable &&
        previous?.[field] === false &&
        currentValue === MissionAction.ControlCheck.NOT_APPLICABLE &&
        values.isUnitBoarded !== false
      ) {
        void setFieldValue(field, undefined)
      }
    })
    // Only re-run when the applicability flags themselves change — not on every value change,
    // otherwise this would fight a user's own answer on a still-applicable field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEISREnabled,
    isApplicabilityResolved,
    applicability.isSeparateStowageOfPreservedSpeciesApplicable,
    applicability.isUnderSizedSeparateRecordingApplicable,
    applicability.isUnderSizedSeparateStowageApplicable,
    values.isUnitBoarded,
    setFieldValue
  ])
}
