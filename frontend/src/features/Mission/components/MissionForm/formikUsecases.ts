import { faoAreasApi } from '@api/faoAreas'
import { getSummedSpeciesOnBoard } from '@features/Logbook/utils'
import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { EnvMissionAction } from '@features/Mission/envMissionAction.types'
import { MissionAction } from '@features/Mission/missionAction.types'
import { getLastControlCircleGeometry } from '@features/Mission/useCases/getLastControlCircleGeometry'
import { vesselApi } from '@features/Vessel/apis'
import { FrontendError } from '@libs/FrontendError'
import { getFleetSegments } from 'domain/use_cases/vessel/getFleetSegments'
import { MultiPolygon } from 'ol/geom'

import { PAMControlUnitIds } from './constants'
import { convertToGeoJSONGeometryObject } from '../../../../domain/entities/layers'

import type { MissionActionFormValues, MissionMainFormValues } from './types'
import type { Option } from '@mtes-mct/monitor-ui'
import type { MainRootState } from '@store'
import type { RiskFactor } from 'domain/entities/vessel/riskFactor/types'
import type { Gear } from 'domain/types/Gear'
import type { GeoJSON } from 'domain/types/GeoJSON'
import type { Port } from 'domain/types/port'
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

    const { gearOnboard } = riskFactor
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
  (dispatch, ports: Port.Port[] | undefined, envActions: EnvMissionAction.MissionAction[]) =>
  async (
    isGeometryComputedFromControls: boolean | undefined,
    missionAction: MissionActionFormValues | MissionAction.MissionAction | undefined
  ) => {
    if (!missionAction || !ports || !isGeometryComputedFromControls) {
      return
    }

    const lastEnvActionDate = envActions
      .filter(
        action =>
          action.actionType === EnvMissionAction.MissionActionType.CONTROL ||
          action.actionType === EnvMissionAction.MissionActionType.SURVEILLANCE
      )
      .map(action => action.actionStartDateTimeUtc)
      .filter((actionStartDateTimeUtc): actionStartDateTimeUtc is string => actionStartDateTimeUtc !== null)
      .sort((a, b) => b.localeCompare(a))[0]

    if (lastEnvActionDate && lastEnvActionDate > missionAction.actionDatetimeUtc) {
      // As a action from Env is newer, we do not update the mission location
      return
    }

    const nextMissionGeometry = await dispatch(getLastControlCircleGeometry(ports, missionAction))
    if (!nextMissionGeometry) {
      return
    }

    dispatch(missionFormActions.setGeometryComputedFromControls(nextMissionGeometry))
  }

const initMissionLocation = dispatch => async (isGeometryComputedFromControls: boolean | undefined) => {
  if (!isGeometryComputedFromControls) {
    return
  }

  const emptyMissionGeometry = convertToGeoJSONGeometryObject(new MultiPolygon([])) as GeoJSON.MultiPolygon

  dispatch(missionFormActions.setGeometryComputedFromControls(emptyMissionGeometry))
}

const updateOtherControlsCheckboxes =
  dispatch => async (mission: MissionMainFormValues, previousIsControlUnitPAM: boolean) => {
    const isControlUnitPAM = mission.controlUnits?.some(
      controlUnit => controlUnit.id && PAMControlUnitIds.includes(controlUnit.id)
    )

    /**
     * If a PAM was already in the control units, we do not reset the other controls
     */
    if (previousIsControlUnitPAM && isControlUnitPAM) {
      return
    }

    dispatch(missionFormActions.mustResetOtherControlsCheckboxes(true))
  }

export const formikUsecase = {
  initMissionLocation,
  updateFAOAreas,
  updateGearsOnboard,
  updateMissionLocation,
  updateOtherControlsCheckboxes,
  updateSegments,
  updateSpeciesOnboard
}
