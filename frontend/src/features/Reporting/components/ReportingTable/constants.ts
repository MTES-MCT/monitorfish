import { ReportingTypeCharacteristics } from '@features/Reporting/types'

import { getReportingOrigin, getReportingTitle } from './utils'

import type { Reporting } from '@features/Reporting/types'
import type { TableOptions } from '@hooks/useTable/types'

export const REPORTING_LIST_TABLE_OPTIONS: TableOptions<Reporting.Reporting> = {
  columns: [
    {
      fixedWidth: 130,
      isSortable: true,
      key: 'validationDate',
      label: 'Ouvert il y a...',
      sortingTransform: item => item.validationDate ?? item.creationDate
    },
    {
      fixedWidth: 130,
      isSortable: true,
      key: 'source',
      label: 'Origine',
      transform: getReportingOrigin
    },
    {
      fixedWidth: 130,
      isSortable: true,
      key: 'type',
      label: 'Type',
      transform: item => ReportingTypeCharacteristics[item.type].name
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
  defaultSortedKey: 'validationDate',
  isCheckable: true,
  isDefaultSortingDesc: true,
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
