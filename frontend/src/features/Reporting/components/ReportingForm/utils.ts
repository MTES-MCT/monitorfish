import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { ReportingType } from '@features/Reporting/types/ReportingType'

import type { FormEditedReporting, InfractionSuspicion, Reporting } from '@features/Reporting/types'

export function getFormFields(editedReporting: Reporting.EditableReporting | undefined): FormEditedReporting {
  const reportingType = editedReporting?.type ?? ReportingType.INFRACTION_SUSPICION
  const value = editedReporting?.value

  const base = {
    authorContact: value?.authorContact,
    cfr: editedReporting?.cfr,
    controlUnitId: value?.controlUnitId,
    description: value?.description,
    expirationDate: editedReporting?.expirationDate,
    externalMarker: editedReporting?.externalMarker,
    flagState: editedReporting?.flagState ?? '',
    gearCode: editedReporting?.gearCode,
    imo: editedReporting?.imo,
    isFishing: editedReporting?.isFishing,
    ircs: editedReporting?.ircs,
    length: editedReporting?.length,
    mmsi: editedReporting?.mmsi,
    latitude: editedReporting?.latitude,
    longitude: editedReporting?.longitude,
    reportingSource: value?.reportingSource ?? ReportingOriginSource.OPS,
    title: value?.title ?? '',
    vesselId: editedReporting?.vesselId,
    vesselIdentifier: editedReporting?.vesselIdentifier,
    vesselName: editedReporting?.vesselName
  }

  if (reportingType === ReportingType.INFRACTION_SUSPICION) {
    return {
      ...base,
      threatHierarchy: (value as InfractionSuspicion | undefined)?.threatHierarchy,
      type: ReportingType.INFRACTION_SUSPICION
    }
  }

  return {
    ...base,
    type: ReportingType.OBSERVATION
  }
}

export function updateReportingSource(
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => Promise<any> | Promise<void>
) {
  return nextReportingSource => {
    setFieldValue('reportingSource', nextReportingSource)

    switch (nextReportingSource) {
      case ReportingOriginSource.OPS: {
        setFieldValue('controlUnitId', undefined)
        setFieldValue('authorContact', undefined)
        setFieldValue('satelliteSource', undefined)
        setFieldValue('otherSourceType', undefined)
        break
      }
      case ReportingOriginSource.SIP: {
        setFieldValue('controlUnitId', undefined)
        setFieldValue('authorContact', undefined)
        setFieldValue('satelliteSource', undefined)
        setFieldValue('otherSourceType', undefined)
        break
      }
      case ReportingOriginSource.UNIT: {
        setFieldValue('satelliteSource', undefined)
        setFieldValue('otherSourceType', undefined)
        break
      }
      case ReportingOriginSource.SATELLITE: {
        setFieldValue('controlUnitId', undefined)
        setFieldValue('authorContact', undefined)
        setFieldValue('otherSourceType', undefined)
        break
      }
      case ReportingOriginSource.OTHER: {
        setFieldValue('controlUnitId', undefined)
        setFieldValue('satelliteSource', undefined)
        break
      }
      default:
        break
    }
  }
}
