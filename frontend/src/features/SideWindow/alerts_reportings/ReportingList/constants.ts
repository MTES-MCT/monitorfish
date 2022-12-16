import { getReportingOrigin, getReportingTitle } from './utils'

import type { InfractionSuspicionReporting, PendingAlertReporting } from '../../../../domain/types/reporting'
import type { TableOptions } from '../../../../hooks/useTable/types'

export const REPORTING_LIST_TABLE_OPTIONS: TableOptions<InfractionSuspicionReporting | PendingAlertReporting> = {
  columns: [
    {
      fixedWidth: 9,
      isSortable: true,
      key: 'validationDate',
      label: 'Ouvert il y a...'
    },
    {
      fixedWidth: 11,
      isSortable: true,
      key: 'value.source',
      label: 'Origine',
      transform: getReportingOrigin
    },
    {
      fixedWidth: 18,
      isSortable: true,
      key: 'value.type',
      label: 'Titre',
      transform: getReportingTitle
    },
    {
      fixedWidth: 9,
      isSortable: true,
      key: 'value.natinfCode',
      label: 'NATINF'
    },
    {
      fixedWidth: 14,
      isSortable: true,
      key: 'vesselName',
      label: 'Navire'
    },
    {
      fixedWidth: 11,
      isSortable: true,
      key: 'value.dml',
      label: 'DML concernées'
    },
    {
      fixedWidth: 2,
      key: '_focusOnMap'
    },
    {
      fixedWidth: 2,
      key: '_edit'
    }
  ],
  isCheckable: true,
  searchableKeys: ['dml', 'externalReferenceNumber', 'internalReferenceNumber', 'ircs', 'reportingTitle', 'vesselName']
}
