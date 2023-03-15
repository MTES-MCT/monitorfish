import { dayjs, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import { Feature } from 'ol'
import { GeoJSON } from 'ol/format'
import Point from 'ol/geom/Point'

import { Mission } from './types'
import { getMissionColor } from '../../../features/map/layers/MissionLayer/styles'
import { booleanToInt } from '../../../utils'
import { LayerType } from '../layers/constants'
import { OLGeometryType } from '../map/constants'

import type { MissionAction } from '../../types/missionAction'
import type { MultiPolygon } from 'ol/geom'

import MissionStatus = Mission.MissionStatus

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

  const feature = new Feature({
    actions,
    color: getMissionColor(missionStatus),
    controlUnits: mission.controlUnits,
    endDateTimeUtc: mission.endDateTimeUtc,
    geometry: new Point(point),
    isClosed: booleanToInt(missionStatus === MissionStatus.CLOSED),
    isDone: booleanToInt(missionStatus === MissionStatus.DONE),
    isInProgress: booleanToInt(missionStatus === MissionStatus.IN_PROGRESS),
    isUpcoming: booleanToInt(missionStatus === MissionStatus.UPCOMING),
    missionId: mission.id,
    missionNature: mission.missionNature,
    missionType: mission.missionType,
    startDateTimeUtc: mission.startDateTimeUtc
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
