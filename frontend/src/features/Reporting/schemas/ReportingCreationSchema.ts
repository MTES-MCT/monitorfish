import { BaseReportingSchema } from '@features/Reporting/schemas/BaseReportingSchema'
import { InfractionSuspicionSchema } from '@features/Reporting/schemas/InfractionSuspicionSchema'

const InfractionSuspicionOrObservationCreation = InfractionSuspicionSchema.omit({
  dml: true,
  natinfCode: true,
  seaFront: true,
  threat: true,
  threatCharacterization: true
})

export const ReportingCreationSchema = BaseReportingSchema.omit({
  createdBy: true,
  id: true,
  infraction: true,
  isArchived: true,
  isDeleted: true,
  underCharter: true
})
  .extend(InfractionSuspicionOrObservationCreation.shape)
  .omit({ authorTrigram: true })
