import { Seafront } from '@constants/seafront'
import { ReportingOriginActor } from '@features/Reporting/types/ReportingOriginActor'
import z from 'zod'

import { numberOrUndefined, stringOrUndefined } from '../../../types'

import type { LegacyControlUnit } from '@features/ControlUnit/legacyControlUnit'

export const InfractionSuspicionSchema = z.strictObject({
  authorContact: stringOrUndefined,
  authorTrigram: stringOrUndefined,
  controlUnit: z.union([z.custom<LegacyControlUnit.LegacyControlUnit>(), z.undefined()]),
  controlUnitId: numberOrUndefined,
  description: stringOrUndefined,
  dml: stringOrUndefined,
  natinfCode: z.number(),
  reportingActor: z.enum(ReportingOriginActor),
  seaFront: z.union([z.enum(Seafront), z.undefined()]),
  threat: z.string(),
  threatCharacterization: z.string(),
  title: z.string()
})
