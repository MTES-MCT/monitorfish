import { ReportingSchema } from '@features/Reporting/schemas/ReportingSchema'
import {
  DynamicVesselGroupSchema,
  FixedVesselGroupSchema,
  HardcodedPriorityVesselGroupSchema
} from '@features/VesselGroup/types'
import { z } from 'zod'

/**
 * Vessel returned when opening a control action form.
 *
 * It only carries the vessel identity along with the shared groups the vessel belongs to and the
 * infraction suspicions opened during its current trip.
 */
export const ControlledVesselSchema = z.strictObject({
  beaconNumber: z.string().optional(),
  districtCode: z.string().optional(),
  externalReferenceNumber: z.string().optional(),
  flagState: z.string(),
  groups: z.array(z.union([FixedVesselGroupSchema, DynamicVesselGroupSchema, HardcodedPriorityVesselGroupSchema])),
  internalReferenceNumber: z.string().optional(),
  ircs: z.string().optional(),
  mmsi: z.string().optional(),
  tripReportings: z.array(ReportingSchema),
  vesselId: z.number(),
  vesselLength: z.number().optional(),
  vesselName: z.string().optional()
})
