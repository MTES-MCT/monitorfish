import { PAMControlUnitIds } from './constants'
import { faoAreasApi } from '../../../api/faoAreas'
import { missionActions as missionSliceActions } from '../../../domain/actions'
import { MissionAction } from '../../../domain/types/missionAction'
import { getLastControlCircleGeometry } from '../../../domain/use_cases/mission/getLastControlCircleGeometry'
import { getFleetSegments } from '../../../domain/use_cases/vessel/getFleetSegments'
import { FrontendError } from '../../../libs/FrontendError'
import { getSummedSpeciesOnBoard } from '../../Logbook/utils'
import { vesselApi } from '../../Vessel/apis'

import type { MissionActionFormValues, MissionMainFormValues } from './types'
import type { RiskFactor } from '../../../domain/entities/vessel/riskFactor/types'
import type { Gear } from '../../../domain/types/Gear'
import type { Port } from '../../../domain/types/port'
import type { MainRootState } from '../../../store'
import type { Option } from '@mtes-mct/monitor-ui'
import type { AnyAction } from 'redux'
import type { ThunkDispatch } from 'redux-thunk'

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
      getFleetSegments(missionAction.faoAreas, missionAction.gearOnboard, missionAction.speciesOnboard)
    )

    const nextFleetSegments = fleetSegmentsAsOptions
      .filter(({ value }) => computedFleetSegments?.find(fleetSegment => fleetSegment.segment === value.segment))
      .map(({ value }) => value)

    setFieldValue('segments', nextFleetSegments)
  }

const updateFAOAreas =
  (dispatch, setFieldValue: (field: string, value: any) => void) =>
  async (missionAction: MissionActionFormValues): Promise<string[]> => {
    const { data: computedVesselFaoAreas } = await dispatch(
      faoAreasApi.endpoints.computeVesselFaoAreas.initiate({
        internalReferenceNumber: missionAction.internalReferenceNumber,
        latitude: missionAction.latitude,
        longitude: missionAction.longitude,
        portLocode: missionAction.portLocode
      })
    )

    setFieldValue('faoAreas', computedVesselFaoAreas)

    return computedVesselFaoAreas
  }

const updateGearsOnboard =
  (
    dispatch: ThunkDispatch<MainRootState, undefined, AnyAction>,
    setFieldValue: (field: string, value: any) => void,
    gearsByCode: Record<string, Gear> | undefined
  ) =>
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
      .map(gear => {
        const gearByCode = gearsByCode[gear.gear]
        if (!gearByCode) {
          throw new FrontendError('`gearByCode` is undefined.')
        }

        return { ...gearByCode, declaredMesh: gear.mesh }
      })
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

const updateOtherControlsCheckboxes = dispatch => async (mission: MissionMainFormValues, previousIsControlUnitPAM: boolean) => {
  const isControlUnitPAM = mission.controlUnits?.some(
    controlUnit => controlUnit.id && PAMControlUnitIds.includes(controlUnit.id)
  )

  /**
   * If a PAM was already in the control units, we do not reset the other controls
   */
  if (previousIsControlUnitPAM && isControlUnitPAM) {
    return
  }

  dispatch(missionSliceActions.mustResetOtherControlsCheckboxes(true))
}

export const formikUsecase = {
  updateFAOAreas,
  updateGearsOnboard,
  updateMissionLocation,
  updateOtherControlsCheckboxes,
  updateSegments,
  updateSpeciesOnboard
}
