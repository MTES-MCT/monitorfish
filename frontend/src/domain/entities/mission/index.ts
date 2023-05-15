import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import { Feature } from 'ol'
import { GeoJSON } from 'ol/format'
import Point from 'ol/geom/Point'
import { transform } from 'ol/proj'

import { Mission } from './types'
import { getMissionStatus } from './utils'
import { getMissionColor } from '../../../features/map/layers/Mission/MissionLayer/styles'
import { getMissionActionInfractionsFromMissionActionFromFormValues } from '../../../features/SideWindow/MissionForm/ActionList/utils'
import { booleanToInt, getDate, getDateTime } from '../../../utils'
import { MissionAction } from '../../types/missionAction'
import { getNumberOfInfractions, getNumberOfInfractionsWithRecord } from '../controls'
import { MonitorFishLayer } from '../layers/types'
import { OpenLayersGeometryType } from '../map/constants'

import type { MissionWithActions } from './types'
import type { MissionFormValues, MissionActionFormValues } from '../../../features/SideWindow/MissionForm/types'
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
    isAirMission: mission.missionTypes.includes(MissionType.AIR),
    isClosed: booleanToInt(missionStatus === MissionStatus.CLOSED),
    isDone: booleanToInt(missionStatus === MissionStatus.DONE),
    isInProgress: booleanToInt(missionStatus === MissionStatus.IN_PROGRESS),
    isLandMission: mission.missionTypes.includes(MissionType.LAND),
    isSeaMission: mission.missionTypes.includes(MissionType.SEA),
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

export type MissionFormValuesWithId = MissionFormValues & {
  id: number
}

export type MissionActionFormValuesWithMissionId = MissionActionFormValues & {
  missionId: number
}

export const getMissionFeatureZone = (mission: Mission.Mission | MissionFormValuesWithId): Feature => {
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

export const getMissionActionFeatures = (mission: MissionFormValuesWithId): Feature[] =>
  mission.actions
    .map(action => getMissionActionFeature({ ...action, missionId: mission.id }))
    .filter((action): action is Feature => !!action)

export const getMissionActionFeature = (
  action: MissionAction.MissionAction | MissionActionFormValuesWithMissionId
): Feature | undefined => {
  if (!action.longitude || !action.latitude) {
    return undefined
  }

  const coordinates = transform([action.longitude, action.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
  const numberOfInfractions = getNumberOfInfractions(action)
  const numberOfInfractionsWithRecords = getNumberOfInfractionsWithRecord(action)
  const hasSpeciesSeized = action.speciesInfractions?.find(infraction => infraction.speciesSeized)
  const hasGearSeized = action.gearInfractions?.find(infraction => infraction.gearSeized)
  const infractions = getMissionActionInfractionsFromMissionActionFromFormValues(action)
  const infractionsNatinfs = infractions.map(({ natinf }) => natinf)

  const feature = new Feature({
    actionType: action.actionType,
    dateTime: getDateTime(action.actionDatetimeUtc, true),
    flagState: action.flagState,
    geometry: new Point(coordinates),
    hasGearSeized,
    hasSpeciesSeized,
    infractionsNatinfs,
    missionId: action.missionId,
    numberOfInfractions,
    numberOfInfractionsWithRecords,
    vesselName: action.vesselName
  })
  feature.setId(`${MonitorFishLayer.MISSION_ACTION_SELECTED}:${action.id}`)

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
