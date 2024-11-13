import type { ProducerOrganizationMembership } from '@features/ProducerOrganizationMembership/types'
import type { ColumnDef } from '@tanstack/react-table'
import type { IFuseOptions } from 'fuse.js'

export const TABLE_COLUMNS: Array<ColumnDef<ProducerOrganizationMembership, any>> = [
  {
    accessorFn: row => row.internalReferenceNumber,
    enableSorting: true,
    header: () => 'Navire (CFR)',
    id: 'internalReferenceNumber'
  },
  {
    accessorFn: row => row.joiningDate,
    enableSorting: true,
    header: () => `Date d'adhésion`,
    id: 'joiningDate'
  },
  {
    accessorFn: row => row.organizationName,
    enableSorting: true,
    header: () => `OP`,
    id: 'organizationName'
  }
]

export const MEMBERSHIP_SEARCH_OPTIONS: IFuseOptions<ProducerOrganizationMembership> = {
  keys: ['internalReferenceNumber', 'organizationName'],
  threshold: 0.4
}

export const DEFAULT_ROWS_DISPLAYED = 50
