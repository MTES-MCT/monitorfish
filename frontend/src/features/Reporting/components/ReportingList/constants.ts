import { getReportingOrigin, getReportingTitle } from './utils'

import type { InfractionSuspicionReporting, PendingAlertReporting } from '../../../../domain/types/reporting'
import type { TableOptions } from '@hooks/useTable/types'

export const REPORTING_LIST_TABLE_OPTIONS: TableOptions<InfractionSuspicionReporting | PendingAlertReporting> = {
  columns: [
    {
      fixedWidth: 130,
      isSortable: true,
      key: 'validationDate',
      label: 'Ouvert il y a...',
      sortingTransform: item => item.validationDate || item.creationDate
    },
    {
      fixedWidth: 130,
      isSortable: true,
      key: 'source',
      label: 'Origine',
      transform: getReportingOrigin
    },
    {
      fixedWidth: 280,
      isSortable: true,
      key: 'title',
      label: 'Titre',
      transform: getReportingTitle
    },
    {
      fixedWidth: 85,
      isSortable: true,
      key: 'value.natinfCode',
      label: 'NATINF'
    },
    {
      fixedWidth: 230,
      isSortable: true,
      key: 'vesselName',
      label: 'Navire'
    },
    {
      fixedWidth: 70,
      isSortable: true,
      key: 'value.dml',
      label: 'DML'
    },
    {
      fixedWidth: 155,
      isSortable: false,
      key: 'underCharter',
      label: ''
    },
    {
      fixedWidth: 40,
      key: '_focusOnMap'
    },
    {
      fixedWidth: 33,
      key: '_edit'
    }
  ],
  isCheckable: true,
  searchableKeys: [
    'value.dml',
    'externalReferenceNumber',
    'internalReferenceNumber',
    'ircs',
    'title',
    'source',
    'value.natinfCode',
    'vesselName'
  ]
}
