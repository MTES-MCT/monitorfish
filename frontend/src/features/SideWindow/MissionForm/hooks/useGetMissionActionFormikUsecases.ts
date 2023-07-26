import { useFormikContext } from 'formik'
import { useMemo } from 'react'

import { useGetFleetSegmentsQuery } from '../../../../api/fleetSegment'
import { useGetPortsQuery } from '../../../../api/port'
import { MissionAction } from '../../../../domain/types/missionAction'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { getFleetSegmentsAsOption } from '../ActionForm/shared/utils'
import { formikUsecase } from '../formikUsecases'

import type { MissionActionFormValues } from '../types'
import type { Option } from '@mtes-mct/monitor-ui'

import MissionActionType = MissionAction.MissionActionType

export function useGetMissionActionFormikUsecases() {
  const dispatch = useMainAppDispatch()
  const gearsByCode = useMainAppSelector(state => state.gear.gearsByCode)
  const { setFieldValue: setMissionActionFieldValue } = useFormikContext<MissionActionFormValues>()
  const draft = useMainAppSelector(store => store.mission.draft)

  const getFleetSegmentsApiQuery = useGetFleetSegmentsQuery()
  const getPortsApiQuery = useGetPortsQuery()

  const fleetSegmentsAsOptions: Option<MissionAction.FleetSegment>[] = useMemo(
    () => getFleetSegmentsAsOption(getFleetSegmentsApiQuery.data),
    [getFleetSegmentsApiQuery.data]
  )

  const updateSegments = (missionActionValues: MissionActionFormValues) =>
    formikUsecase.updateSegments(dispatch, setMissionActionFieldValue, fleetSegmentsAsOptions)(missionActionValues)

  /**
   * Update FAO Areas and segments from the control coordinates or port input
   */
  async function updateFAOAreasAndSegments(missionActionValues: MissionActionFormValues) {
    const faoAreas = await formikUsecase.updateFAOAreas(dispatch, setMissionActionFieldValue)(missionActionValues)

    await formikUsecase.updateSegments(
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

    const gearOnboard = await formikUsecase.updateGearsOnboard(
      dispatch,
      setMissionActionFieldValue,
      gearsByCode
    )(missionActionValues)

    const speciesOnboard = await formikUsecase.updateSpeciesOnboard(
      dispatch,
      setMissionActionFieldValue
    )(missionActionValues)

    const faoAreas = await formikUsecase.updateFAOAreas(dispatch, setMissionActionFieldValue)(missionActionValues)

    await formikUsecase.updateSegments(
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
   * When updating the mission location from an action, we use the `draft` object to access the `mission` form.
   * The mission location is equal to the current action geometry modified.
   */
  const updateMissionLocation = (missionActionValues: MissionActionFormValues) =>
    formikUsecase.updateMissionLocation(dispatch, getPortsApiQuery.data)(
      draft?.mainFormValues?.isGeometryComputedFromControls,
      missionActionValues
    )

  return {
    updateFAOAreasAndSegments,
    updateFieldsControlledByVessel,
    updateMissionLocation,
    updateSegments
  }
}
