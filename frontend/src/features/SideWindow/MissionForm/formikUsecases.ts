import { MissionActionFormValues } from './types'
import { faoAreasApi } from '../../../api/faoAreas'
import { missionActions as missionSliceActions } from '../../../domain/actions'
import { MissionAction } from '../../../domain/types/missionAction'
import { Port } from '../../../domain/types/port'
import { getLastControlCircleGeometry } from '../../../domain/use_cases/mission/getLastControlCircleGeometry'
import { getFleetSegments } from '../../../domain/use_cases/vessel/getFleetSegments'

import type { Option } from '@mtes-mct/monitor-ui'

export const updateSegments =
  (
    dispatch,
    setFieldValue: (field: string, value: any) => void,
    fleetSegmentsAsOptions: Option<MissionAction.FleetSegment>[]
  ) =>
  async (missionAction: MissionActionFormValues) => {
    const computedFleetSegments = await dispatch(
      getFleetSegments(
        missionAction.faoAreas,
        missionAction.gearOnboard,
        missionAction.speciesOnboard,
        missionAction.longitude,
        missionAction.latitude,
        missionAction.portLocode
      )
    )

    const nextFleetSegments = fleetSegmentsAsOptions
      .filter(({ value }) => computedFleetSegments?.find(fleetSegment => fleetSegment.segment === value.segment))
      .map(({ value }) => value)

    setFieldValue('segments', nextFleetSegments)
  }

export const updateFAOAreas =
  (dispatch, setFieldValue: (field: string, value: any) => void) =>
  async (missionAction: MissionActionFormValues): Promise<string[]> => {
    if (!missionAction.internalReferenceNumber) {
      setFieldValue('faoAreas', [])

      return []
    }

    const { data: computedVesselFaoAreas } = await dispatch(
      faoAreasApi.endpoints.computeVesselFaoAreas.initiate({
        internalReferenceNumber: missionAction.internalReferenceNumber,
        latitude: missionAction.latitude,
        longitude: missionAction.longitude
      })
    )

    setFieldValue('faoAreas', computedVesselFaoAreas)

    return computedVesselFaoAreas
  }

export const updateMissionLocation =
  (dispatch, ports: Port.Port[] | undefined) =>
  async (isGeometryComputedFromControls: boolean | undefined, missionAction: MissionActionFormValues | undefined) => {
    if (!missionAction || !ports || !isGeometryComputedFromControls) {
      return
    }

    const nextMissionGeometry = await dispatch(getLastControlCircleGeometry(ports, missionAction))
    if (!nextMissionGeometry) {
      return
    }

    dispatch(missionSliceActions.setGeometryComputedFromControls(nextMissionGeometry))
  }
