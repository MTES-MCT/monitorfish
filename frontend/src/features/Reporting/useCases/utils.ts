import { ReportingType } from '@features/Reporting/types/ReportingType'
import { ReportingValidityOption } from '@features/Reporting/types/ReportingValidityOption'
import { customDayjs } from '@mtes-mct/monitor-ui'

import type { FormEditedReporting, ReportingCreation } from '@features/Reporting/types'
import type { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'

export function computeExpirationDate(formValues: FormEditedReporting): string | undefined {
  if (formValues.validityOption === ReportingValidityOption.ONE_MONTH) {
    return customDayjs().utc().add(1, 'month').toISOString()
  }
  if (formValues.validityOption === ReportingValidityOption.TWELVE_MONTHS) {
    return customDayjs().utc().add(12, 'month').toISOString()
  }

  return formValues.expirationDate
}

export function toReportingPayload(formValues: FormEditedReporting, isIUU = false): ReportingCreation {
  return {
    authorContact: formValues.authorContact,
    cfr: formValues.cfr,
    controlUnitId: formValues.controlUnitId,
    creationDate: new Date().toISOString(),
    description: formValues.description,
    expirationDate: computeExpirationDate(formValues),
    externalMarker: formValues.externalMarker,
    flagState: (formValues.flagState ?? '').toUpperCase(),
    gearCode: formValues.gearCode,
    imo: formValues.imo,
    ircs: formValues.ircs,
    isFishing: formValues.isFishing,
    isIUU,
    latitude: formValues.latitude,
    length: formValues.length,
    longitude: formValues.longitude,
    validityOption: formValues.validityOption,
    mmsi: formValues.mmsi,
    numberOfVessels: formValues.numberOfVessels,
    otherSourceType: formValues.otherSourceType,
    reportingDate: formValues.reportingDate,
    reportingSource: formValues.reportingSource as ReportingOriginSource,
    satelliteType: formValues.satelliteType,
    threatHierarchies:
      formValues.type === ReportingType.INFRACTION_SUSPICION
        ? (formValues.infractions ?? []).map((i: any) => i.threatHierarchy).filter(Boolean)
        : [],
    title: formValues.title as string,
    type: formValues.type,
    validationDate: undefined,
    vesselId: formValues.vesselId,
    vesselIdentifier: formValues.vesselIdentifier,
    vesselName: formValues.vesselName
  }
}
