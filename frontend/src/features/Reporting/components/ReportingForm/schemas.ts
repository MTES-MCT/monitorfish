import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { customDayjs } from '@mtes-mct/monitor-ui'
import z from 'zod'

export const CreateOrEditReportingSchema = z
  .object({
    authorContact: z.string().optional(),
    controlUnitId: z.number().optional(),
    expirationDate: z.string().optional(),
    externalMarker: z.string().optional(),
    imo: z.string().optional(),
    ircs: z.string().optional(),
    isArchived: z.boolean().optional(),
    isIUU: z.boolean().optional(),
    isUnknownVessel: z.boolean().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    mmsi: z.string().optional(),
    otherSourceType: z.string().optional(),
    reportingDate: z.iso.datetime('Veuillez renseigner la date et heure du signalement.'),
    reportingSource: z.enum(ReportingOriginSource),
    satelliteSource: z.string().optional(),
    threatHierarchy: z.any().optional(),
    title: z.string().min(1, 'Veuillez renseigner le titre du signalement.'),
    type: z.enum(ReportingType),
    vesselName: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (data.isIUU) {
      if (data.latitude === undefined || data.latitude === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Veuillez renseigner la localisation.',
          path: ['latitude']
        })
      }
      if (data.longitude === undefined || data.longitude === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Veuillez renseigner la localisation.',
          path: ['longitude']
        })
      }
    }

    if (data.type === ReportingType.INFRACTION_SUSPICION && !data.threatHierarchy) {
      ctx.addIssue({
        code: 'custom',
        message: 'Veuillez renseigner le NATINF.',
        path: ['threatHierarchy']
      })
    }

    if (data.reportingSource === ReportingOriginSource.UNIT && !data.controlUnitId) {
      ctx.addIssue({
        code: 'custom',
        message: "Veuillez renseigner l'unité",
        path: ['controlUnitId']
      })
    }

    if (data.reportingSource === ReportingOriginSource.SATELLITE && !data.satelliteSource) {
      ctx.addIssue({
        code: 'custom',
        message: 'Veuillez renseigner la source satellite.',
        path: ['satelliteSource']
      })
    }

    if (data.reportingSource === ReportingOriginSource.OTHER && !data.otherSourceType) {
      ctx.addIssue({
        code: 'custom',
        message: "Veuillez renseigner le type d'autre source.",
        path: ['otherSourceType']
      })
    }

    if (
      (data.reportingSource === ReportingOriginSource.UNIT || data.reportingSource === ReportingOriginSource.OTHER) &&
      !data.authorContact
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Veuillez renseigner le contact',
        path: ['authorContact']
      })
    }

    if (data.expirationDate && !data.isArchived && !customDayjs().isBefore(data.expirationDate)) {
      ctx.addIssue({
        code: 'custom',
        message: 'La date de fin de validité doit être dans le futur.',
        path: ['expirationDate']
      })
    }

    const hasVesselIdentifier = !!(data.vesselName ?? data.mmsi ?? data.imo ?? data.ircs ?? data.externalMarker)
    if (!hasVesselIdentifier && !data.isUnknownVessel) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Veuillez renseigner au moins un identifiant (nom, MMSI, IMO ou marquage extérieur) ou cocher la case "navire inconnu".',
        path: ['isUnknownVessel']
      })
    }
  })
