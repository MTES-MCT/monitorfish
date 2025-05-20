import type { LegacyControlUnit } from '../ControlUnit/legacyControlUnit'
import type { MissionAction } from '../Mission/missionAction.types'
import type { Vessel } from '@features/Vessel/Vessel.types'

export type ActivityReports = {
  activityReports: ActivityReport[]
  jdpSpecies: string[]
}

export type ActivityReport = {
  action: MissionAction.MissionAction
  activityCode: ActivityCode
  controlUnits: LegacyControlUnit.LegacyControlUnit[]
  faoArea: string | undefined
  segment: string | undefined
  vessel: Vessel.SelectedVessel
  vesselNationalIdentifier: string
}

export type ActivityReportWithId = ActivityReport & {
  id: number
}

enum ActivityCode {
  FIS,
  LAN
}
