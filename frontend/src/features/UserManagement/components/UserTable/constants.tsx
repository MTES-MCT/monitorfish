import { Ellipsised } from '@components/Ellipsised'
import { Accent, Icon, IconButton, Toggle } from '@mtes-mct/monitor-ui'

import { getDateTime } from '../../../../utils'
import { EXTERNAL_ADMINISTRATION_LABEL } from '../../constants'

import type { UserManagement } from '../../types'
import type { AccessorColumnDef } from '@tanstack/table-core/build/lib/types'

export function getTableColumns(
  currentUserEmail: string | undefined,
  onDelete: (user: UserManagement.User) => void,
  onIsAdministratorChange: (user: UserManagement.User, isAdministrator: boolean) => void
): Array<AccessorColumnDef<UserManagement.User, any>> {
  return [
    {
      accessorFn: row => row.email ?? '',
      cell: info => <Ellipsised>{info.getValue<string>() || 'E-mail inconnu (utilisateur antérieur)'}</Ellipsised>,
      enableSorting: true,
      header: () => 'E-mail',
      id: 'email',
      size: 320
    },
    {
      accessorFn: row => (row.isSuperUser ? 'CNSP' : 'Externe'),
      cell: info => info.getValue<string>(),
      enableSorting: true,
      header: () => 'Type',
      id: 'type',
      size: 100
    },
    {
      accessorFn: row => row.isSuperUser && row.isAdministrator,
      cell: info =>
        info.row.original.isSuperUser && (
          <Toggle
            checked={info.getValue<boolean>()}
            // An administrator can't remove its own administrator rights
            disabled={info.row.original.email === currentUserEmail?.toLowerCase()}
            isLabelHidden
            label={`Administrateur ${info.row.original.email ?? info.row.original.hashedEmail}`}
            name={`isAdministrator-${info.row.original.hashedEmail}`}
            onChange={isChecked => onIsAdministratorChange(info.row.original, isChecked)}
          />
        ),
      enableSorting: true,
      header: () => 'Admin.',
      id: 'isAdministrator',
      size: 80
    },
    {
      accessorFn: row => row.service ?? '',
      cell: info => info.getValue<string>(),
      enableSorting: true,
      header: () => 'Service CNSP',
      id: 'service',
      size: 180
    },
    {
      accessorFn: row => (row.administration ? EXTERNAL_ADMINISTRATION_LABEL[row.administration] : ''),
      cell: info => info.getValue<string>(),
      enableSorting: true,
      header: () => 'Administration',
      id: 'administration',
      size: 200
    },
    {
      accessorFn: row => row.lastLoginAtUtc ?? '',
      cell: info => getDateTime(info.getValue<string>(), true),
      enableSorting: true,
      header: () => 'Dernière connexion (UTC)',
      id: 'lastLoginAtUtc',
      size: 200
    },
    {
      accessorFn: row => row.hashedEmail,
      cell: info => (
        <IconButton
          accent={Accent.TERTIARY}
          Icon={Icon.Delete}
          onClick={() => onDelete(info.row.original)}
          title="Supprimer cet utilisateur"
        />
      ),
      enableSorting: false,
      header: () => '',
      id: 'delete',
      size: 44
    }
  ]
}
