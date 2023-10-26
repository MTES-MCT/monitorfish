import type { Vessel } from '../../../../domain/entities/vessel/types'
import type { ControlUnit } from '../../../../domain/types/controlUnit'
import type { MissionAction } from '../../../../domain/types/missionAction'

export type ActivityReport = {
  action: MissionAction.MissionAction
  activityCode: ActivityCode
  controlUnits: ControlUnit.ControlUnit[]
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
