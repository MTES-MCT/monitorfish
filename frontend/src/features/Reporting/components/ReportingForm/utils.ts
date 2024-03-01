import { ReportingOriginActor } from '@features/Reporting/types'

export function updateReportingActor(
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => Promise<any> | Promise<void>
) {
  return nextReportingActor => {
    setFieldValue('reportingActor', nextReportingActor)

    switch (nextReportingActor) {
      case ReportingOriginActor.OPS.code: {
        setFieldValue('controlUnitId', undefined)
        setFieldValue('authorContact', undefined)
        break
      }
      case ReportingOriginActor.SIP.code: {
        setFieldValue('controlUnitId', undefined)
        setFieldValue('authorContact', undefined)
        break
      }
      case ReportingOriginActor.UNIT.code: {
        setFieldValue('authorTrigram', undefined)
        break
      }
      case ReportingOriginActor.DML.code: {
        setFieldValue('controlUnitId', undefined)
        setFieldValue('authorTrigram', undefined)
        break
      }
      case ReportingOriginActor.DIRM.code: {
        setFieldValue('controlUnitId', undefined)
        setFieldValue('authorTrigram', undefined)
        break
      }
      case ReportingOriginActor.OTHER.code: {
        setFieldValue('controlUnitId', undefined)
        setFieldValue('authorTrigram', undefined)
        break
      }
      default:
        throw Error('Should not happen')
    }
  }
}
