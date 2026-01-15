import { PendingAlertValueSchema } from '@features/Alert/schemas/PendingAlertValueSchema'
import { BaseReportingSchema } from '@features/Reporting/schemas/BaseReportingSchema'
import { InfractionSuspicionSchema } from '@features/Reporting/schemas/InfractionSuspicionSchema'
import { ObservationSchema } from '@features/Reporting/schemas/ObservationSchema'
import z from 'zod'

import { ReportingType } from '../types/ReportingType'

export const InfractionSuspicionReportingSchema = BaseReportingSchema.extend({
  type: z.literal(ReportingType.INFRACTION_SUSPICION),
  value: InfractionSuspicionSchema
})

export const ObservationReportingSchema = BaseReportingSchema.extend({
  type: z.literal(ReportingType.OBSERVATION),
  value: ObservationSchema
})

export const PendingAlertReportingSchema = BaseReportingSchema.extend({
  type: z.literal(ReportingType.ALERT),
  value: PendingAlertValueSchema
})

export const ReportingSchema = z.discriminatedUnion('type', [
  InfractionSuspicionReportingSchema,
  ObservationReportingSchema,
  PendingAlertReportingSchema
])
