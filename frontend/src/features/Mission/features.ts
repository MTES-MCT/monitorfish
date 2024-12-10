import { MainMap } from '@features/MainMap/MainMap.types'
import { getMissionActionInfractionsFromMissionActionFormValues } from '@features/Mission/components/MissionForm/ActionList/utils'
import { Mission } from '@features/Mission/mission.types'
import { MissionAction } from '@features/Mission/missionAction.types'
import { getMissionColor, getMissionCompletionFrontStatus, getMissionStatus } from '@features/Mission/utils'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import { random } from 'lodash'
import { Feature } from 'ol'
import { GeoJSON } from 'ol/format'
import Point from 'ol/geom/Point'
import { circular } from 'ol/geom/Polygon'
import { transform } from 'ol/proj'

import { CONTROL_ZONE_RADIUS, MISSION_ACTION_ZONE_FEATURE_ID } from './constants'
import { getNumberOfInfractions, getNumberOfInfractionsWithRecord } from '../../domain/entities/controls'
import { booleanToInt, getDate, getDateTime } from '../../utils'
import { OpenLayersGeometryType } from '../MainMap/constants'

import type { MissionActionFormValues, MissionMainFormValues } from '@features/Mission/components/MissionForm/types'
import type { MultiPolygon } from 'ol/geom'

import MissionStatus = Mission.MissionStatus
import MissionActionType = MissionAction.MissionActionType
import MissionType = Mission.MissionType

export function getMissionFeaturePointId(id: number) {
  return `${MainMap.MonitorFishLayer.MISSION_PIN_POINT}:${id}`
}

export const getMissionFeaturePoint = (
  mission: Mission.MissionWithActions | MissionMainFormValuesWithId
): Feature<Point> | undefined => {
  const actions = (mission as Mission.MissionWithActions).actions ?? []
  const envActions = (mission as Mission.MissionWithActions).envActions ?? []
  const missionTypes = mission.missionTypes ?? []

  const geoJSON = new GeoJSON()

  if (!mission.geom?.coordinates.length) {
    return undefined
  }

  const geometry = geoJSON.readGeometry(mission.geom, {
    dataProjection: WSG84_PROJECTION,
    featureProjection: OPENLAYERS_PROJECTION
  })

  if (geometry?.getType() !== OpenLayersGeometryType.MULTIPOLYGON) {
    return undefined
  }

  const point = (geometry as MultiPolygon).getInteriorPoints().getFirstCoordinate()

  const missionStatus = getMissionStatus(mission)
  const numberOfControls = actions.filter(
    action =>
      action.actionType === MissionActionType.AIR_CONTROL ||
      action.actionType === MissionActionType.LAND_CONTROL ||
      action.actionType === MissionActionType.SEA_CONTROL
  ).length
  const numberOfSurveillance = actions.filter(action => action.actionType === MissionActionType.AIR_SURVEILLANCE).length
  const actionsCompletion = actions.map(action => action.completion)

  const feature = new Feature({
    color: getMissionColor(missionStatus),
    controlUnits: mission.controlUnits,
    endDateTimeUtc: mission.endDateTimeUtc,
    geometry: new Point(point),
    hasEnvActions: envActions.length > 0,
    hasFishActions: actions.length > 0,
    isAirMission: missionTypes.length === 1 && missionTypes.includes(MissionType.AIR),
    isDone: booleanToInt(missionStatus === MissionStatus.DONE),
    isInProgress: booleanToInt(missionStatus === MissionStatus.IN_PROGRESS),
    isLandMission: missionTypes.length === 1 && missionTypes.includes(MissionType.LAND),
    isMultiMission: missionTypes.length > 1,
    isSeaMission: missionTypes.length === 1 && missionTypes.includes(MissionType.SEA),
    isUpcoming: booleanToInt(missionStatus === MissionStatus.UPCOMING),
    missionCompletion: getMissionCompletionFrontStatus(mission, actionsCompletion),
    missionId: mission.id,
    missionStatus,
    missionTypes: mission.missionTypes,
    numberOfControls,
    numberOfSurveillance,
    startDateTimeUtc: getDate(mission.startDateTimeUtc)
  })
  feature.setId(getMissionFeaturePointId(mission.id))

  return feature
}

export type MissionMainFormValuesWithId = MissionMainFormValues & {
  id: number
}

export const getMissionFeatureZone = (
  mission: Mission.Mission | MissionMainFormValuesWithId,
  type: MainMap.MonitorFishLayer
): Feature => {
  const geoJSON = new GeoJSON()
  const geometry = geoJSON.readGeometry(mission.geom, {
    dataProjection: WSG84_PROJECTION,
    featureProjection: OPENLAYERS_PROJECTION
  })

  const missionStatus = getMissionStatus(mission)
  const feature = new Feature({
    controlUnits: mission.controlUnits,
    endDateTimeUtc: mission.endDateTimeUtc,
    geometry,
    missionId: mission.id,
    missionStatus,
    missionTypes: mission.missionTypes,
    startDateTimeUtc: mission.startDateTimeUtc
  })
  feature.setId(`${type}:${mission.id}`)

  return feature
}

export const getMissionActionFeature = (
  action: MissionAction.MissionAction | MissionActionFormValues
): Feature | undefined => {
  if (!action.longitude || !action.latitude) {
    return undefined
  }

  const coordinates = transform([action.longitude, action.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
  const numberOfInfractions = getNumberOfInfractions(action)
  const numberOfInfractionsWithRecords = getNumberOfInfractionsWithRecord(action)
  const infractions = getMissionActionInfractionsFromMissionActionFormValues(action)
  const infractionsNatinfs = infractions.map(({ natinf }) => natinf)

  const actionId = action.id ?? random(1000)
  const feature = new Feature({
    actionType: action.actionType,
    dateTime: getDateTime(action.actionDatetimeUtc, true),
    flagState: action.flagState,
    geometry: new Point(coordinates),
    hasSomeGearsSeized: action.hasSomeGearsSeized,
    hasSomeSpeciesSeized: action.hasSomeSpeciesSeized,
    infractionsNatinfs,
    missionId: action.missionId,
    numberOfInfractions,
    numberOfInfractionsWithRecords,
    vesselName: action.vesselName
  })
  feature.setId(`${MainMap.MonitorFishLayer.MISSION_ACTION_SELECTED}:${actionId}`)

  return feature
}

/**
 * A feature to display a zone around a control.
 */
export const getMissionActionFeatureZone = (
  action: MissionAction.MissionAction | MissionActionFormValues
): Feature | undefined => {
  if (!action.longitude || !action.latitude) {
    return undefined
  }

  const actionId = action.id ?? random(1000)
  const feature = new Feature({
    geometry: circular([action.longitude, action.latitude], CONTROL_ZONE_RADIUS, 64).transform(
      WSG84_PROJECTION,
      OPENLAYERS_PROJECTION
    )
  })
  feature.setId(`${MISSION_ACTION_ZONE_FEATURE_ID}:${actionId}`)

  return feature
}
