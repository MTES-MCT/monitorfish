import { ThreatSchema } from '@features/Infraction/schemas/ThreatSchema'
import { BaseReportingSchema } from '@features/Reporting/schemas/BaseReportingSchema'
import { InfractionSuspicionSchema } from '@features/Reporting/schemas/InfractionSuspicionSchema'
import { ReportingValidityOption } from '@features/Reporting/types/ReportingValidityOption'
import { z } from 'zod'

const InfractionSuspicionOrObservationCreation = InfractionSuspicionSchema.omit({
  dml: true,
  seaFront: true
})

export const ReportingCreationSchema = BaseReportingSchema.omit({
  createdBy: true,
  id: true,
  infraction: true,
  isArchived: true,
  isDeleted: true,
  lastUpdateDate: true,
  underCharter: true
})
  .extend(InfractionSuspicionOrObservationCreation.shape)
  .omit({ authorTrigram: true, controlUnit: true, infractions: true })
  .extend({
    threatHierarchies: z.array(ThreatSchema),
    validityOption: z.nativeEnum(ReportingValidityOption).optional()
  })
