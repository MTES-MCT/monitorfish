import { Seafront } from '@constants/seafront'
import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { OtherSourceType } from '@features/Reporting/types/OtherSourceType'
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
  otherSourceType: z.enum(OtherSourceType).or(z.undefined()),
  satelliteType: z.enum(SatelliteSource).or(z.undefined()),
  description: stringOrUndefined,
  dml: stringOrUndefined,
  reportingSource: z.enum(ReportingOriginSource).or(z.undefined()),
  seaFront: z.union([z.enum(Seafront), z.undefined()]),
  title: z.string()
})
