import { useFormikContext } from 'formik'
import { useMemo } from 'react'

import { useGetFleetSegmentsQuery } from '../../../../api/fleetSegment'
import { useGetPortsQuery } from '../../../../api/port'
import { MissionAction } from '../../../../domain/types/missionAction'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { getFleetSegmentsAsOption } from '../ActionForm/shared/utils'
import { updateFAOAreas, updateMissionLocation, updateSegments } from '../formikUsecases'

import type { MissionActionFormValues } from '../types'
import type { Option } from '@mtes-mct/monitor-ui'

export function useGetMissionActionFormikUsecases() {
  const dispatch = useMainAppDispatch()
  const { setFieldValue: setMissionActionFieldValue } = useFormikContext<MissionActionFormValues>()
  const draft = useMainAppSelector(store => store.mission.draft)

  const getFleetSegmentsApiQuery = useGetFleetSegmentsQuery()
  const getPortsApiQuery = useGetPortsQuery()

  const fleetSegmentsAsOptions: Option<MissionAction.FleetSegment>[] = useMemo(
    () => getFleetSegmentsAsOption(getFleetSegmentsApiQuery.data),
    [getFleetSegmentsApiQuery.data]
  )

  return {
    /**
     * Update FAO Areas and segments from the
     * - control coordinates or port input
     * - vessel input
     * @param missionActionValues
     */
    updateFAOAreasAndSegments: (missionActionValues: MissionActionFormValues) => {
      ;(async () => {
        const nextFaoAreas = await updateFAOAreas(dispatch, setMissionActionFieldValue)(missionActionValues)

        await updateSegments(
          dispatch,
          setMissionActionFieldValue,
          fleetSegmentsAsOptions
        )({
          ...missionActionValues,
          faoAreas: nextFaoAreas
        })
      })()
    },
    /**
     * When updating the mission location from an action, we use the `draft` object to access the `mission` form.
     * The mission location is equal to the current action geometry modified.
     */
    updateMissionLocation: (missionActionValues: MissionActionFormValues) =>
      updateMissionLocation(dispatch, getPortsApiQuery.data)(
        draft?.mainFormValues?.isGeometryComputedFromControls,
        missionActionValues
      ),
    updateSegments: (missionActionValues: MissionActionFormValues) =>
      updateSegments(dispatch, setMissionActionFieldValue, fleetSegmentsAsOptions)(missionActionValues)
  }
}
