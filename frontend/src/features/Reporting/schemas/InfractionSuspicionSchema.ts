import { Seafront } from '@constants/seafront'
import { InfractionSchema } from '@features/Infraction/schemas/InfractionSchema'
import { ThreatSchema } from '@features/Infraction/schemas/ThreatSchema'
import { OtherSourceType } from '@features/Reporting/types/OtherSourceType'
import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { SatelliteSource } from '@features/Reporting/types/SatelliteSource'
import z from 'zod'

import { numberOrUndefined, stringOrUndefined } from '../../../types'

import type { LegacyControlUnit } from '@features/ControlUnit/legacyControlUnit'

export const InfractionSuspicionThreatSchema = z.object({
  infraction: InfractionSchema.optional(),
  natinfCode: z.number(),
  threat: z.string(),
  threatCharacterization: z.string(),
  threatHierarchy: ThreatSchema.optional()
})

export const InfractionSuspicionSchema = z.strictObject({
  authorContact: stringOrUndefined,
  /** @deprecated Use createdBy instead */
  authorTrigram: stringOrUndefined,
  controlUnit: z.custom<LegacyControlUnit.LegacyControlUnit>().optional(),
  controlUnitId: numberOrUndefined,
  description: stringOrUndefined,
  dml: stringOrUndefined,
  infractions: z.array(InfractionSuspicionThreatSchema),
  numberOfVessels: numberOrUndefined,
  otherSourceType: z.enum(OtherSourceType).optional(),
  reportingSource: z.enum(ReportingOriginSource).optional(),
  satelliteType: z.enum(SatelliteSource).optional(),
  seaFront: z.enum(Seafront).optional(),
  title: z.string()
})
