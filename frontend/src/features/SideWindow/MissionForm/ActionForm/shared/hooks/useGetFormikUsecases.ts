import { useFormikContext } from 'formik'
import { useMemo } from 'react'

import { useGetFleetSegmentsQuery } from '../../../../../../api/fleetSegment'
import { MissionAction } from '../../../../../../domain/types/missionAction'
import { useMainAppDispatch } from '../../../../../../hooks/useMainAppDispatch'
import { MissionActionFormValues } from '../../../types'
import { updateFAOAreas, updateSegments } from '../formikUsecases'
import { getFleetSegmentsAsOption } from '../utils'

import type { Option } from '@mtes-mct/monitor-ui'

export function useGetFormikUsecases() {
  const dispatch = useMainAppDispatch()
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()

  const getFleetSegmentsApiQuery = useGetFleetSegmentsQuery()

  const fleetSegmentsAsOptions: Option<MissionAction.FleetSegment>[] = useMemo(
    () => getFleetSegmentsAsOption(getFleetSegmentsApiQuery.data),
    [getFleetSegmentsApiQuery.data]
  )

  return {
    updateFAOAreas: () => updateFAOAreas(dispatch, setFieldValue)(values),
    updateFAOAreasAndSegments: () => {
      ;(async () => {
        await updateFAOAreas(dispatch, setFieldValue)(values)
        /**
         * TODO We can't wait for setFieldValue to complete, see https://github.com/jaredpalmer/formik/issues/529
         * So a timeout makes the formik setFieldValue (which contains an internal useState) to be completed
         */
        setTimeout(() => updateSegments(dispatch, setFieldValue, fleetSegmentsAsOptions)(values), 0)
      })()
    },
    updateSegments: () => updateSegments(dispatch, setFieldValue, fleetSegmentsAsOptions)(values)
  }
}
