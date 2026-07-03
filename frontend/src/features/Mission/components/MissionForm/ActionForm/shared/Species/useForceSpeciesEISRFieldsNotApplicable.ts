import { MissionAction } from '@features/Mission/missionAction.types'
import { useFormikContext } from 'formik'
import { useEffect } from 'react'

import { getApplicabilityByFieldName } from './getSpeciesEISRApplicability'

import type { SpeciesEISRApplicability } from './getSpeciesEISRApplicability'
import type { MissionActionFormValues } from '../../../types'

// FormikGangwayField.tsx's GANGWAY_DEPENDENT_FIELDS effect targets these same three fields for a
// different reason (gangway not deployed) — its NOT_APPLICABLE always takes precedence, so this
// effect never resets a field away from NOT_APPLICABLE while the gangway isn't deployed.
export function useForceSpeciesEISRFieldsNotApplicable(
  isEISREnabled: boolean,
  applicability: SpeciesEISRApplicability
): void {
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()

  useEffect(() => {
    if (!isEISREnabled) {
      return
    }

    Object.entries(getApplicabilityByFieldName(applicability)).forEach(([field, isApplicable]) => {
      const currentValue = values[field as keyof MissionActionFormValues]

      if (!isApplicable && currentValue !== MissionAction.ControlCheck.NOT_APPLICABLE) {
        void setFieldValue(field, MissionAction.ControlCheck.NOT_APPLICABLE)
      } else if (
        isApplicable &&
        currentValue === MissionAction.ControlCheck.NOT_APPLICABLE &&
        values.isGangwayDeployed !== false
      ) {
        void setFieldValue(field, undefined)
      }
    })
    // Only re-run when the applicability flags themselves change — not on every value change,
    // otherwise this would fight a user's own answer on a still-applicable field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEISREnabled,
    applicability.isSeparateStowageOfPreservedSpeciesApplicable,
    applicability.isUnderSizedSeparateRecordingApplicable,
    applicability.isUnderSizedSeparateStowageApplicable,
    values.isGangwayDeployed,
    setFieldValue
  ])
}
