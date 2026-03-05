import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { customDayjs } from '@mtes-mct/monitor-ui'
import z from 'zod'

export const CreateOrEditReportingSchema = z
  .object({
    authorContact: z.string().optional(),
    controlUnitId: z.number().optional(),
    expirationDate: z.string().optional(),
    reportingSource: z.enum(ReportingOriginSource),
    threatHierarchy: z.any().optional(),
    title: z.string().min(1, 'Veuillez renseigner le titre du signalement.'),
    type: z.enum(ReportingType)
  })
  .superRefine((data, ctx) => {
    if (data.type === ReportingType.INFRACTION_SUSPICION && !data.threatHierarchy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Veuillez renseigner le NATINF.',
        path: ['threatHierarchy']
      })
    }
    if (data.reportingSource === ReportingOriginSource.UNIT && !data.controlUnitId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Veuillez renseigner l'unité",
        path: ['controlUnitId']
      })
    }
    if (data.reportingSource === ReportingOriginSource.OTHER && !data.authorContact) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Veuillez renseigner le contact',
        path: ['authorContact']
      })
    }
    if (data.expirationDate && !customDayjs().isBefore(data.expirationDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La date de fin de validité doit être dans le futur.',
        path: ['expirationDate']
      })
    }
  })
