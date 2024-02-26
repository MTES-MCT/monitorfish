import { customDayjs } from '@mtes-mct/monitor-ui'
import { toAlpha3 } from 'i18n-iso-countries'

import { getCoordinates } from '../../../../coordinates'
import { CoordinatesFormat, WSG84_PROJECTION } from '../../../../domain/entities/map/constants'
import { formatDMDCoordinateForActivityReport, getPatrolType } from '../../utils'

import type { ActivityReportWithId } from '../../types'
import type { DownloadAsCsvMap } from '@utils/downloadAsCsv'

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const JDP_CSV_MAP_BASE: DownloadAsCsvMap<ActivityReportWithId> = {
  patrolCode: {
    label: 'PATROL_CODE',
    transform: activity => getPatrolType(activity) + (activity.controlUnits[0]?.name ?? '')
  },
  patrolType: {
    label: 'PATROL_TYPE',
    transform: activity => getPatrolType(activity)
  },
  controlUnit: {
    label: 'MEAN_ID',
    transform: activity => activity.controlUnits[0]?.name ?? ''
  },
  jdpCode: 'JDP_CODE',
  eventType: {
    label: 'EVENT_TYPE',
    transform: () => 'INSPECTION'
  },
  eventDate: {
    label: 'EVENT_DATE',
    transform: activity => {
      const dateTime = customDayjs(activity.action.actionDatetimeUtc)

      return `${dateTime.year()}${dateTime.month()}${dateTime.date()}`
    }
  },
  eventTime: {
    label: 'EVENT_TIME',
    transform: activity => {
      const dateTime = customDayjs(activity.action.actionDatetimeUtc)

      return `${dateTime.hour()}:${dateTime.minute()}`
    }
  },
  // See MED JDP Decision 2018/030 (3.6.1.1)
  eventHour: {
    label: 'EVENT_HOUR',
    transform: activity => {
      const dateTime = customDayjs(activity.action.actionDatetimeUtc)

      return `${dateTime.hour()}:${dateTime.minute()}`
    }
  },
  leadingState: {
    label: 'LS',
    transform: () => 'FRA'
  },
  PS1: {
    label: 'PS1',
    transform: () => 'FRA'
  },
  // Not filled
  PS2: 'PS2',
  // Not filled
  PS3: 'PS3',
  NATIONAL_REFERENCE: 'NATIONAL_REFERENCE',
  objectType: {
    label: 'OBJECT_TYPE',
    transform: () => 'Vessel'
  },
  objectState: {
    label: 'OBJECT_STATE',
    transform: activity => toAlpha3(activity.vessel.flagState) || 'UNK'
  },
  vesselNationalIdentifier: 'OBJECT_NATIONAL_ID',
  'vessel.ircs': 'RC',
  'vessel.internalReferenceNumber': 'CFR',
  'vessel.vesselName': 'NA',
  activityCode: 'ACTIVITY_CODE',
  gearCode: {
    label: 'GEAR_CODE',
    transform: activity => activity.action.gearOnboard[0]?.gearCode || ''
  },
  meshSize: {
    label: 'MESH_SIZE',
    transform: activity =>
      activity.action.gearOnboard[0]?.controlledMesh ?? (activity.action.gearOnboard[0]?.declaredMesh || '')
  },
  faoArea: {
    label: 'FAO_AREA_CODE',
    transform: activity => activity.action.faoAreas[0] ?? ''
  },
  fleetSegment: {
    label: 'FLEET_SEGMENT',
    transform: activity => activity.action.segments[0]?.segment ?? ''
  },
  latitude: {
    label: 'LA',
    transform: activity => {
      const dmdCoordinates = getCoordinates(
        [activity.action.longitude, activity.action.latitude],
        WSG84_PROJECTION,
        CoordinatesFormat.DEGREES_MINUTES_DECIMALS
      )

      return formatDMDCoordinateForActivityReport(dmdCoordinates[0])
    }
  },
  longitude: {
    label: 'LO',
    transform: activity => {
      const dmdCoordinates = getCoordinates(
        [activity.action.longitude, activity.action.latitude],
        WSG84_PROJECTION,
        CoordinatesFormat.DEGREES_MINUTES_DECIMALS
      )

      return formatDMDCoordinateForActivityReport(dmdCoordinates[1])
    }
  },
  'action.portLocode': 'PORT_CODE',
  countryCode: {
    label: 'COUNTRY_CODE',
    transform: () => 'FRA'
  },
  'action.portName': 'PORT_NAME',
  // Not filled
  LOCATION: 'LOCATION'
  // 'SPECIES', 'INFR' and 'COMMENT' are added in getJDPCsvMap()
}
/* eslint-enable sort-keys-fix/sort-keys-fix */
