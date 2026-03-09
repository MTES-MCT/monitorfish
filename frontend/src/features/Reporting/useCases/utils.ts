import { ReportingType } from '@features/Reporting/types/ReportingType'

import type { FormEditedReporting, ReportingCreation } from '@features/Reporting/types'
import type { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import type { Vessel } from '@features/Vessel/Vessel.types'

export function buildReportingCreation(
  formValues: FormEditedReporting,
  vesselIdentity: Vessel.VesselIdentity | undefined
): ReportingCreation {
  return {
    authorContact: formValues.authorContact,
    cfr: vesselIdentity?.internalReferenceNumber ?? formValues.cfr,
    controlUnit: formValues.controlUnit,
    controlUnitId: formValues.controlUnitId,
    creationDate: new Date().toISOString(),
    description: formValues.description,
    expirationDate: formValues.expirationDate,
    externalMarker: vesselIdentity?.externalReferenceNumber ?? formValues.externalMarker,
    flagState: (vesselIdentity?.flagState ?? formValues.flagState ?? '').toUpperCase(),
    imo: formValues.imo,
    ircs: vesselIdentity?.ircs ?? formValues.ircs,
    length: formValues.length,
    mmsi: formValues.mmsi,
    reportingSource: formValues.reportingSource as ReportingOriginSource,
    threatHierarchy: formValues.type === ReportingType.INFRACTION_SUSPICION ? formValues.threatHierarchy : undefined,
    title: formValues.title as string,
    type: formValues.type,
    validationDate: undefined,
    vesselId: vesselIdentity?.vesselId ?? formValues.vesselId,
    vesselIdentifier: vesselIdentity?.vesselIdentifier ?? formValues.vesselIdentifier,
    vesselName: vesselIdentity?.vesselName ?? formValues.vesselName
  }
}
