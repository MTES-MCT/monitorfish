import { Ellipsised } from '@components/Ellipsised'

import { getDateTime } from '../../../../utils'
import { AUTHORIZATION_AUDIT_ACTION_LABEL } from '../../constants'
import {
  getAuthorizationAuditLogActor,
  getAuthorizationAuditLogDetails,
  getAuthorizationAuditLogTarget
} from '../../utils'

import type { UserManagement } from '../../types'
import type { AccessorColumnDef } from '@tanstack/table-core/build/lib/types'

export const TABLE_COLUMNS: Array<AccessorColumnDef<UserManagement.AuthorizationAuditLog, any>> = [
  {
    accessorFn: row => row.createdAtUtc,
    cell: info => getDateTime(info.getValue<string>(), true),
    enableSorting: false,
    header: () => 'Date (UTC)',
    id: 'createdAtUtc',
    size: 160
  },
  {
    accessorFn: getAuthorizationAuditLogActor,
    cell: info => <Ellipsised>{info.getValue<string>()}</Ellipsised>,
    enableSorting: false,
    header: () => 'Auteur',
    id: 'actor',
    size: 240
  },
  {
    accessorFn: row => AUTHORIZATION_AUDIT_ACTION_LABEL[row.action],
    cell: info => <Ellipsised>{info.getValue<string>()}</Ellipsised>,
    enableSorting: false,
    header: () => 'Action',
    id: 'action',
    size: 280
  },
  {
    accessorFn: getAuthorizationAuditLogTarget,
    cell: info => <Ellipsised>{info.getValue<string>()}</Ellipsised>,
    enableSorting: false,
    header: () => 'Cible',
    id: 'target',
    size: 260
  },
  {
    accessorFn: getAuthorizationAuditLogDetails,
    cell: info => <Ellipsised>{info.getValue<string>()}</Ellipsised>,
    enableSorting: false,
    header: () => 'Détail',
    id: 'details',
    size: 400
  }
]
