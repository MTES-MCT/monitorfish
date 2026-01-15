import { Seafront } from '@constants/seafront'
import { ReportingOriginActor } from '@features/Reporting/types/ReportingOriginActor'
import z from 'zod'

import { numberOrUndefined, stringOrUndefined } from '../../../types'

import type { LegacyControlUnit } from '@features/ControlUnit/legacyControlUnit'

export const ObservationSchema = z.strictObject({
  authorContact: stringOrUndefined,
  /** @deprecated Use createdBy instead */
  authorTrigram: stringOrUndefined,
  controlUnit: z.union([z.custom<LegacyControlUnit.LegacyControlUnit>(), z.undefined()]),
  controlUnitId: numberOrUndefined,
  description: stringOrUndefined,
  dml: stringOrUndefined,
  reportingActor: z.enum(ReportingOriginActor),
  seaFront: z.union([z.enum(Seafront), z.undefined()]),
  title: z.string()
})
