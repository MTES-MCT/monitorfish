import { getReportingOrigin, getReportingTitle } from '@features/Reporting/components/ReportingTable/utils'

import type { Reporting } from '@features/Reporting/types'
import type { DownloadAsCsvMap } from '@utils/downloadAsCsv'

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const REPORTING_CSV_MAP: DownloadAsCsvMap<Reporting.Reporting> = {
  creationDate: 'Ouvert le',
  'value.dml': 'DML concernée',
  type: {
    label: 'Origine',
    transform: getReportingOrigin
  },
  'value.type': {
    label: 'Titre',
    transform: getReportingTitle
  },
  'value.description': 'Description',
  'value.natinfCode': 'NATINF',
  flagState: 'Pavillon',
  vesselName: 'Navire',
  internalReferenceNumber: 'CFR',
  externalReferenceNumber: 'Marquage ext.',
  ircs: 'C/S',
  underCharter: {
    label: 'Navire sous charte',
    transform: reporting => (reporting.underCharter ? 'OUI' : 'NON')
  },
  'value.seaFront': 'Façade'
}
/* eslint-enable sort-keys-fix/sort-keys-fix */
