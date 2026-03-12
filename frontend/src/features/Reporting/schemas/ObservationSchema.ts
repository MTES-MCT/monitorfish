import { Seafront } from '@constants/seafront'
import { OtherSourceType } from '@features/Reporting/types/OtherSourceType'
import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { SatelliteSource } from '@features/Reporting/types/SatelliteSource'
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
  otherSourceType: z.enum(OtherSourceType).or(z.undefined()),
  reportingSource: z.enum(ReportingOriginSource).or(z.undefined()),
  satelliteType: z.enum(SatelliteSource).or(z.undefined()),
  seaFront: z.union([z.enum(Seafront), z.undefined()]),
  title: z.string()
})
