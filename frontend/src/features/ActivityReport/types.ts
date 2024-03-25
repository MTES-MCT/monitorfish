import type { Vessel } from '../../domain/entities/vessel/types'
import type { LegacyControlUnit } from '../../domain/types/legacyControlUnit'
import type { MissionAction } from '../Mission/missionAction.types'

export type ActivityReports = {
  activityReports: ActivityReport[]
  jdpSpecies: string[]
}

export type ActivityReport = {
  action: MissionAction.MissionAction
  activityCode: ActivityCode
  controlUnits: LegacyControlUnit.LegacyControlUnit[]
  vessel: Vessel
  vesselNationalIdentifier: string
}

export type ActivityReportWithId = ActivityReport & {
  id: number
}

enum ActivityCode {
  FIS,
  LAN
}
