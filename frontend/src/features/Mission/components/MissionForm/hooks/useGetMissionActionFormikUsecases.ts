import { useGetPortsQuery } from '@api/port'
import { useGetFleetSegmentsQuery } from '@features/FleetSegment/apis'
import { initMissionGeometry } from '@features/Mission/components/MissionForm/useCases/initMissionGeometry'
import { updateActionFAOAreas } from '@features/Mission/components/MissionForm/useCases/updateActionFAOAreas'
import { updateActionGearsOnboard } from '@features/Mission/components/MissionForm/useCases/updateActionGearsOnboard'
import { updateActionSegments } from '@features/Mission/components/MissionForm/useCases/updateActionSegments'
import { updateActionSpeciesOnboard } from '@features/Mission/components/MissionForm/useCases/updateActionSpeciesOnboard'
import { updateMissionGeometry } from '@features/Mission/components/MissionForm/useCases/updateMissionGeometry'
import { MissionAction } from '@features/Mission/missionAction.types'
import { useGetMissionQuery } from '@features/Mission/monitorfishMissionApi'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { skipToken } from '@reduxjs/toolkit/query'
import { useFormikContext } from 'formik'
import { useMemo } from 'react'

import { getFleetSegmentsAsOption } from '../ActionForm/shared/utils'

import type { MissionActionFormValues } from '../types'
import type { Option } from '@mtes-mct/monitor-ui'

import MissionActionType = MissionAction.MissionActionType

export function useGetMissionActionFormikUsecases() {
  const dispatch = useMainAppDispatch()
  const gearsByCode = useMainAppSelector(state => state.gear.gearsByCode)
  const draft = useMainAppSelector(state => state.missionForm.draft)
  const { setFieldValue: setMissionActionFieldValue } = useFormikContext<MissionActionFormValues>()

  const getFleetSegmentsApiQuery = useGetFleetSegmentsQuery()
  const getPortsApiQuery = useGetPortsQuery()
  const getMissionApiQuery = useGetMissionQuery(draft?.mainFormValues?.id ?? skipToken)

  const fleetSegmentsAsOptions: Option<MissionAction.FleetSegment>[] = useMemo(
    () => getFleetSegmentsAsOption(getFleetSegmentsApiQuery.data),
    [getFleetSegmentsApiQuery.data]
  )

  const updateSegments = (missionActionValues: MissionActionFormValues) =>
    updateActionSegments(dispatch, setMissionActionFieldValue, fleetSegmentsAsOptions)(missionActionValues)

  /**
   * Update FAO Areas and segments from the control coordinates or port input
   */
  async function updateFAOAreasAndSegments(missionActionValues: MissionActionFormValues) {
    const faoAreas = await updateActionFAOAreas(dispatch, setMissionActionFieldValue)(missionActionValues)

    await updateActionSegments(
      dispatch,
      setMissionActionFieldValue,
      fleetSegmentsAsOptions
    )({
      ...missionActionValues,
      faoAreas
    })
  }

  /**
   * Update on vessel change:
   * - FAO Areas
   * - Segments
   * - species onboard
   * - gear onboard
   */
  async function updateFieldsControlledByVessel(missionActionValues: MissionActionFormValues) {
    if (missionActionValues.actionType === MissionActionType.AIR_CONTROL) {
      return
    }

    const gearOnboard = await updateActionGearsOnboard(
      dispatch,
      setMissionActionFieldValue,
      gearsByCode
    )(missionActionValues)

    const speciesOnboard = await updateActionSpeciesOnboard(dispatch, setMissionActionFieldValue)(missionActionValues)

    const faoAreas = await updateActionFAOAreas(dispatch, setMissionActionFieldValue)(missionActionValues)

    await updateActionSegments(
      dispatch,
      setMissionActionFieldValue,
      fleetSegmentsAsOptions
    )({
      ...missionActionValues,
      faoAreas,
      gearOnboard,
      speciesOnboard
    })
  }

  /**
   * When updating the mission location from an action, we use the `RTK-Query` cache object to access the `mission` form.
   * The mission location is equal to the current action geometry modified.
   */
  const updateMissionLocation = (missionActionValues: MissionActionFormValues) =>
    updateMissionGeometry(
      dispatch,
      getPortsApiQuery.data,
      getMissionApiQuery.data?.envActions ?? [],
      getMissionApiQuery.data?.actions ?? []
    )(draft?.mainFormValues.isGeometryComputedFromControls, missionActionValues)

  /**
   * When updating the mission location from an action, we use the `RTK-Query` cache object to access the `mission` form.
   */
  const initMissionLocation = () => initMissionGeometry(dispatch)(draft?.mainFormValues.isGeometryComputedFromControls)

  return {
    initMissionLocation,
    updateFAOAreasAndSegments,
    updateFieldsControlledByVessel,
    updateMissionLocation,
    updateSegments
  }
}
