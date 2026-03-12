import { ReportingType } from '@features/Reporting/types/ReportingType'

import type { FormEditedReporting, ReportingCreation } from '@features/Reporting/types'
import type { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'

export function buildReportingCreation(formValues: FormEditedReporting): ReportingCreation {
  return {
    authorContact: formValues.authorContact,
    cfr: formValues.cfr,
    controlUnit: formValues.controlUnit,
    controlUnitId: formValues.controlUnitId,
    creationDate: new Date().toISOString(),
    description: formValues.description,
    expirationDate: formValues.expirationDate,
    externalMarker: formValues.externalMarker,
    flagState: (formValues.flagState ?? '').toUpperCase(),
    gearCode: formValues.gearCode,
    imo: formValues.imo,
    ircs: formValues.ircs,
    isFishing: formValues.isFishing,
    latitude: formValues.latitude,
    length: formValues.length,
    longitude: formValues.longitude,
    mmsi: formValues.mmsi,
    otherSourceType: formValues.otherSourceType,
    reportingDate: formValues.reportingDate,
    reportingSource: formValues.reportingSource as ReportingOriginSource,
    satelliteType: formValues.satelliteType,
    threatHierarchy: formValues.type === ReportingType.INFRACTION_SUSPICION ? formValues.threatHierarchy : undefined,
    title: formValues.title as string,
    type: formValues.type,
    validationDate: undefined,
    vesselId: formValues.vesselId,
    vesselIdentifier: formValues.vesselIdentifier,
    vesselName: formValues.vesselName
  }
}
