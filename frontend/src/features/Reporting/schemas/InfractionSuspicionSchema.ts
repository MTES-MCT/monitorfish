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
  infraction: InfractionSchema.or(z.undefined()),
  natinfCode: z.number(),
  threat: z.string(),
  threatCharacterization: z.string(),
  threatHierarchy: ThreatSchema.or(z.undefined())
})

export const InfractionSuspicionSchema = z.strictObject({
  authorContact: stringOrUndefined,
  /** @deprecated Use createdBy instead */
  authorTrigram: stringOrUndefined,
  controlUnit: z.union([z.custom<LegacyControlUnit.LegacyControlUnit>(), z.undefined()]),
  controlUnitId: numberOrUndefined,
  description: stringOrUndefined,
  dml: stringOrUndefined,
  infractions: z.array(InfractionSuspicionThreatSchema),
  otherSourceType: z.enum(OtherSourceType).or(z.undefined()),
  reportingSource: z.enum(ReportingOriginSource).or(z.undefined()),
  satelliteType: z.enum(SatelliteSource).or(z.undefined()),
  seaFront: z.union([z.enum(Seafront), z.undefined()]),
  title: z.string()
})
