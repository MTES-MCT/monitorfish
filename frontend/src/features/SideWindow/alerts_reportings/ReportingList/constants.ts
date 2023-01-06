import { getReportingOrigin, getReportingTitle } from './utils'

import type { InfractionSuspicionReporting, PendingAlertReporting } from '../../../../domain/types/reporting'
import type { TableOptions } from '../../../../hooks/useTable/types'

export const REPORTING_LIST_TABLE_OPTIONS: TableOptions<InfractionSuspicionReporting | PendingAlertReporting> = {
  columns: [
    {
      fixedWidth: 144,
      isSortable: true,
      key: 'validationDate',
      label: 'Ouvert il y a...'
    },
    {
      fixedWidth: 176,
      isSortable: true,
      key: 'value.source',
      label: 'Origine',
      transform: getReportingOrigin
    },
    {
      fixedWidth: 288,
      isSortable: true,
      key: 'value.type',
      label: 'Titre',
      transform: getReportingTitle
    },
    {
      fixedWidth: 64,
      isSortable: true,
      key: 'value.natinfCode',
      label: 'NATINF'
    },
    {
      fixedWidth: 224,
      isSortable: true,
      key: 'vesselName',
      label: 'Navire'
    },
    {
      fixedWidth: 176,
      isSortable: true,
      key: 'value.dml',
      label: 'DML concernées'
    },
    {
      fixedWidth: 144,
      isSortable: false,
      key: 'underCharter',
      label: ''
    },
    {
      fixedWidth: 33,
      key: '_focusOnMap'
    },
    {
      fixedWidth: 32,
      key: '_edit'
    }
  ],
  isCheckable: true,
  searchableKeys: ['dml', 'externalReferenceNumber', 'internalReferenceNumber', 'ircs', 'reportingTitle', 'vesselName']
}
