import { Ellipsised } from '@components/Ellipsised'
import { Accent, Icon, IconButton, Tag, THEME, Toggle } from '@mtes-mct/monitor-ui'

import { getDateTime } from '../../../../utils'
import { getUserAffiliation } from '../../utils'

import type { UserManagement } from '../../types'
import type { AccessorColumnDef } from '@tanstack/table-core/build/lib/types'

export function getTableColumns(
  currentUserEmail: string | undefined,
  onDelete: (user: UserManagement.User) => void,
  onIsAdministratorChange: (user: UserManagement.User, isAdministrator: boolean) => void
): Array<AccessorColumnDef<UserManagement.User, any>> {
  const isCurrentUser = (user: UserManagement.User) => user.email === currentUserEmail?.toLowerCase()

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
      accessorFn: getUserAffiliation,
      cell: info => (
        <Tag
          backgroundColor={info.row.original.isSuperUser ? THEME.color.charcoal : THEME.color.gainsboro}
          color={info.row.original.isSuperUser ? THEME.color.white : THEME.color.charcoal}
        >
          {info.getValue<string>()}
        </Tag>
      ),
      enableSorting: true,
      header: () => 'Rattachement',
      id: 'affiliation',
      size: 240
    },
    {
      accessorFn: row => row.isSuperUser && row.isAdministrator,
      cell: info =>
        info.row.original.isSuperUser && (
          <Toggle
            checked={info.getValue<boolean>()}
            disabled={isCurrentUser(info.row.original)}
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
          disabled={isCurrentUser(info.row.original)}
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
