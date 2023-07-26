import { faoAreasApi } from '../../../api/faoAreas'
import { vesselApi } from '../../../api/vessel'
import { missionActions as missionSliceActions } from '../../../domain/actions'
import { getSummedSpeciesOnBoard } from '../../../domain/entities/logbook/species'
import { MissionAction } from '../../../domain/types/missionAction'
import { getLastControlCircleGeometry } from '../../../domain/use_cases/mission/getLastControlCircleGeometry'
import { getFleetSegments } from '../../../domain/use_cases/vessel/getFleetSegments'

import type { MissionActionFormValues } from './types'
import type { RiskFactor } from '../../../domain/entities/vessel/riskFactor/types'
import type { Gear } from '../../../domain/types/Gear'
import type { Port } from '../../../domain/types/port'
import type { Option } from '@mtes-mct/monitor-ui'

const updateSegments =
  (
    dispatch,
    setFieldValue: (field: string, value: any) => void,
    fleetSegmentsAsOptions: Option<MissionAction.FleetSegment>[]
  ) =>
  async (missionAction: MissionActionFormValues) => {
    if (missionAction.actionType === MissionAction.MissionActionType.AIR_CONTROL) {
      return
    }

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

const updateFAOAreas =
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

const updateGearsOnboard =
  (dispatch, setFieldValue: (field: string, value: any) => void, gearsByCode: Map<string, Gear> | undefined) =>
  async (missionAction: MissionActionFormValues): Promise<MissionAction.GearControl[]> => {
    if (!gearsByCode || !missionAction.internalReferenceNumber) {
      return []
    }

    const { data: riskFactor } = await dispatch(
      vesselApi.endpoints.getRiskFactor.initiate(missionAction.internalReferenceNumber)
    )
    if (!riskFactor) {
      return []
    }

    const { gearOnboard } = riskFactor as RiskFactor
    if (!gearOnboard?.length) {
      return []
    }

    const nextGears = gearOnboard
      .map(gear => ({ ...gearsByCode[gear.gear], declaredMesh: gear.mesh }))
      .map(gear => ({
        comments: undefined,
        controlledMesh: undefined,
        declaredMesh: gear.declaredMesh,
        gearCode: gear.code,
        gearName: gear.name,
        gearWasControlled: undefined,
        hasUncontrolledMesh: false
      }))

    setFieldValue('gearOnboard', nextGears)

    return nextGears
  }

const updateSpeciesOnboard =
  (dispatch, setFieldValue: (field: string, value: any) => void) =>
  async (missionAction: MissionActionFormValues): Promise<MissionAction.SpeciesControl[]> => {
    if (!missionAction.internalReferenceNumber) {
      return []
    }

    const { data: riskFactor } = await dispatch(
      vesselApi.endpoints.getRiskFactor.initiate(missionAction.internalReferenceNumber)
    )
    if (!riskFactor) {
      return []
    }

    const { speciesOnboard } = riskFactor as RiskFactor
    if (!speciesOnboard?.length) {
      return []
    }

    const summedSpeciesOnboard = getSummedSpeciesOnBoard(speciesOnboard)
    const nextSpeciesOnboard = summedSpeciesOnboard
      .sort((a, b) => b.weight - a.weight)
      .map(specy => ({
        controlledWeight: undefined,
        declaredWeight: specy.weight,
        nbFish: undefined,
        speciesCode: specy.species,
        underSized: false
      }))

    setFieldValue('speciesOnboard', nextSpeciesOnboard)

    return nextSpeciesOnboard
  }

const updateMissionLocation =
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

export const formikUsecase = {
  updateFAOAreas,
  updateGearsOnboard,
  updateMissionLocation,
  updateSegments,
  updateSpeciesOnboard
}
