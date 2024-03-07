import { getMissionActionInfractionsFromMissionActionFormValues } from '@features/Mission/components/MissionForm/ActionList/utils'
import { isLandControl } from '@features/Mission/useCases/getLastControlCircleGeometry'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import { random } from 'lodash'
import { Feature } from 'ol'
import { GeoJSON } from 'ol/format'
import Point from 'ol/geom/Point'
import { circular } from 'ol/geom/Polygon'
import { transform } from 'ol/proj'

import { LAND_CONTROL_ZONE_RADIUS, SEA_CONTROL_ZONE_RADIUS } from './constants'
import { Mission } from './types'
import { getMissionStatus } from './utils'
import { getMissionColor } from '../../../features/Mission/layers/MissionLayer/styles'
import { booleanToInt, getDate, getDateTime } from '../../../utils'
import { MissionAction } from '../../types/missionAction'
import { getNumberOfInfractions, getNumberOfInfractionsWithRecord } from '../controls'
import { MonitorFishLayer } from '../layers/types'
import { OpenLayersGeometryType } from '../map/constants'

import type { MissionWithActions } from './types'
import type { MissionActionFormValues, MissionMainFormValues } from '@features/Mission/components/MissionForm/types'
import type { MultiPolygon } from 'ol/geom'

import MissionStatus = Mission.MissionStatus
import MissionActionType = MissionAction.MissionActionType
import MissionType = Mission.MissionType
import MissionSource = Mission.MissionSource

export function getMissionFeaturePointId(id: number) {
  return `${MonitorFishLayer.MISSION_PIN_POINT}:${id}`
}

export const getMissionFeaturePoint = ({ actions, ...mission }: MissionWithActions): Feature<Point> | undefined => {
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

  const feature = new Feature({
    color: getMissionColor(missionStatus),
    controlUnits: mission.controlUnits,
    endDateTimeUtc: mission.endDateTimeUtc,
    geometry: new Point(point),
    isAirMission: mission.missionTypes.length === 1 && mission.missionTypes.includes(MissionType.AIR),
    isClosed: booleanToInt(missionStatus === MissionStatus.CLOSED),
    isDone: booleanToInt(missionStatus === MissionStatus.DONE),
    isInProgress: booleanToInt(missionStatus === MissionStatus.IN_PROGRESS),
    isLandMission: mission.missionTypes.length === 1 && mission.missionTypes.includes(MissionType.LAND),
    isMultiMission: mission.missionTypes.length > 1,
    isSeaMission: mission.missionTypes.length === 1 && mission.missionTypes.includes(MissionType.SEA),
    isUpcoming: booleanToInt(missionStatus === MissionStatus.UPCOMING),
    missionId: mission.id,
    missionSource: mission.missionSource,
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

export const getMissionFeatureZone = (mission: Mission.Mission | MissionMainFormValuesWithId): Feature => {
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
  feature.setId(`${MonitorFishLayer.MISSION_HOVER}:${mission.id}`)

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

  const actionId = action.id || random(1000)
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
  feature.setId(`${MonitorFishLayer.MISSION_ACTION_SELECTED}:${actionId}`)

  return feature
}

export const getMissionActionFeatureZone = (
  action: MissionAction.MissionAction | MissionActionFormValues
): Feature | undefined => {
  if (!action.longitude || !action.latitude) {
    return undefined
  }

  const radius = isLandControl(action) ? LAND_CONTROL_ZONE_RADIUS : SEA_CONTROL_ZONE_RADIUS

  const actionId = action.id || random(1000)
  const feature = new Feature({
    actionType: action.actionType,
    dateTime: getDateTime(action.actionDatetimeUtc, true),
    geometry: circular([action.longitude, action.latitude], radius, 64).transform(
      WSG84_PROJECTION,
      OPENLAYERS_PROJECTION
    ),
    isGeometryComputedFromControls: true,
    missionId: action.missionId
  })
  feature.setId(`${MonitorFishLayer.MISSION_ACTION_ZONE}:${actionId}`)

  return feature
}

export function getMissionSourceTagText(missionSource: MissionSource | undefined) {
  switch (missionSource) {
    case Mission.MissionSource.MONITORFISH:
      return 'Ouverte par le CNSP'
    case Mission.MissionSource.POSEIDON_CACEM:
      return 'Ouverte par le CACEM (POSEIDON)'
    case Mission.MissionSource.POSEIDON_CNSP:
      return 'Ouverte par le CNSP (POSEIDON)'
    case Mission.MissionSource.MONITORENV:
      return 'Ouverte par le CACEM'
    default:
      return 'Origine inconnue'
  }
}
