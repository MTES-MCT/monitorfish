import { MissionAction } from '@features/Mission/missionAction.types'
import { useFormikContext } from 'formik'
import { useEffect, useRef } from 'react'

import type { MissionActionFormValues } from '../../types'

// logbookMatchesActivity is * (always required) — not affected by gangway
const GANGWAY_DEPENDENT_FIELDS: Array<keyof MissionActionFormValues> = [
  'emitsVms',
  'emitsAis',
  'licencesMatchActivity',
  'separateStowageOfPreservedSpecies',
  'speciesWeightControlled',
  'speciesSizeControlled'
]

export function FormikGangwayEffect() {
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()
  const prevGangway = useRef(values.isGangwayDeployed)

  useEffect(() => {
    if (values.isGangwayDeployed === prevGangway.current) return
    prevGangway.current = values.isGangwayDeployed

    if (values.isGangwayDeployed === false) {
      GANGWAY_DEPENDENT_FIELDS.forEach(field =>
        setFieldValue(field, MissionAction.ControlCheck.NOT_APPLICABLE)
      )
    } else if (values.isGangwayDeployed === true) {
      GANGWAY_DEPENDENT_FIELDS.forEach(field => setFieldValue(field, undefined))
    }
  }, [values.isGangwayDeployed, setFieldValue])

  return null
}
