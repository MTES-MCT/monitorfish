import { ReportingType } from '@features/Reporting/types/ReportingType'
import { GroupType } from '@features/VesselGroup/types'
import { z } from 'zod'

/**
 * Snapshot of the vessel's shared groups and current-trip reportings stored on a control at the moment
 * of control. Kept as a flat, self-contained shape (not the full group/reporting objects).
 */
export const MissionActionVesselGroupSchema = z.object({
  color: z.string(),
  id: z.number(),
  isPriorityGroup: z.boolean(),
  name: z.string(),
  type: z.enum(GroupType)
})

export const MissionActionReportingThreatSchema = z.object({
  natinfCode: z.number().nullable(),
  threat: z.string().nullable(),
  threatCharacterization: z.string().nullable()
})

export const MissionActionReportingSchema = z.object({
  id: z.number(),
  threats: z.array(MissionActionReportingThreatSchema),
  title: z.string().nullable(),
  type: z.enum(ReportingType)
})

export type MissionActionVesselGroup = z.infer<typeof MissionActionVesselGroupSchema>
export type MissionActionReporting = z.infer<typeof MissionActionReportingSchema>
