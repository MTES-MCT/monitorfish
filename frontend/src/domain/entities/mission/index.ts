import { dayjs, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import { Feature } from 'ol'
import { GeoJSON } from 'ol/format'
import Point from 'ol/geom/Point'

import { Mission } from './types'
import { getMissionColor } from '../../../features/map/layers/Mission/MissionLayer/styles'
import { booleanToInt, getDate } from '../../../utils'
import { MissionAction } from '../../types/missionAction'
import { LayerType } from '../layers/constants'
import { OLGeometryType } from '../map/constants'

import type { MultiPolygon } from 'ol/geom'

import MissionStatus = Mission.MissionStatus
import MissionTypeLabel = Mission.MissionTypeLabel
import MissionActionType = MissionAction.MissionActionType
import MissionType = Mission.MissionType

export function getMissionFeaturePointId(id: number) {
  return `${LayerType.MISSION}:${id}`
}

export const getMissionFeaturePoint = (
  mission: Mission.Mission,
  actions: MissionAction.MissionAction[]
): Feature<Point> | undefined => {
  const geoJSON = new GeoJSON()
  const geometry = geoJSON.readGeometry(mission.geom, {
    dataProjection: WSG84_PROJECTION,
    featureProjection: OPENLAYERS_PROJECTION
  })

  if (geometry?.getType() !== OLGeometryType.MULTIPOLYGON) {
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
    isAirMission: mission.missionType === MissionType.AIR,
    isClosed: booleanToInt(missionStatus === MissionStatus.CLOSED),
    isDone: booleanToInt(missionStatus === MissionStatus.DONE),
    isInProgress: booleanToInt(missionStatus === MissionStatus.IN_PROGRESS),
    isLandMission: mission.missionType === MissionType.LAND,
    isSeaMission: mission.missionType === MissionType.SEA,
    isUpcoming: booleanToInt(missionStatus === MissionStatus.UPCOMING),
    missionId: mission.id,
    missionNature: mission.missionNature,
    missionSource: mission.missionSource,
    missionStatus,
    missionType: MissionTypeLabel[mission.missionType],
    numberOfControls,
    numberOfSurveillance,
    startDateTimeUtc: getDate(mission.startDateTimeUtc)
  })
  feature.setId(getMissionFeaturePointId(mission.id))

  return feature
}

export const getMissionFeatureZone = (mission: Mission.Mission): Feature => {
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
    missionNature: mission.missionNature,
    missionStatus,
    missionType: mission.missionType,
    startDateTimeUtc: mission.startDateTimeUtc
  })
  feature.setId(`${LayerType.MISSION_HOVER}:${mission.id}`)

  return feature
}

export const getMissionStatus = ({
  endDateTimeUtc,
  isClosed,
  startDateTimeUtc
}: {
  endDateTimeUtc?: string
  isClosed?: Boolean
  startDateTimeUtc?: string
}): Mission.MissionStatus | undefined => {
  if (isClosed) {
    return Mission.MissionStatus.CLOSED
  }

  if (!startDateTimeUtc) {
    return undefined
  }

  const now = dayjs()
  if (dayjs(startDateTimeUtc).isAfter(now)) {
    return Mission.MissionStatus.UPCOMING
  }

  if (endDateTimeUtc && dayjs(endDateTimeUtc).isBefore(now)) {
    return Mission.MissionStatus.DONE
  }

  return MissionStatus.IN_PROGRESS
}
