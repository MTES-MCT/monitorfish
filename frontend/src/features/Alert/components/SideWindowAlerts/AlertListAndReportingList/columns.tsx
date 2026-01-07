import { Ellipsised } from '@components/Ellipsised'
import { getAlertCriteriaSummary } from '@features/Alert/components/SideWindowAlerts/AlertsManagementList/cells/utils'
import { Flag } from '@features/commonComponents/Flag'
import countries from 'i18n-iso-countries'
import * as timeago from 'timeago.js'

import { ActionCell } from './cells/ActionCell'

import type { PendingAlert } from '../../../types'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { Promisable } from 'type-fest'

export function getPendingAlertsTableColumns(
  openSilenceAlertMenu?: (pendingAlert: PendingAlert, anchorElement: HTMLElement) => Promisable<void>
): Array<ColumnDef<PendingAlert, any>> {
  const baseUrl = window.location.origin

  return [
    {
      accessorFn: row => row.creationDate,
      cell: ({ row }: CellContext<PendingAlert, string>) => {
        const alert = row.original

        return <span title={alert.creationDate}>{timeago.format(new Date(alert.creationDate).getTime(), 'fr')}</span>
      },
      enableSorting: true,
      header: () => 'Depuis...',
      id: 'creationDate',
      size: 100
    },
    {
      accessorFn: row => row.vesselName,
      cell: ({ row }: CellContext<PendingAlert, string>) => {
        const alert = row.original

        return (
          <Ellipsised style={{ alignItems: 'center', display: 'flex' }}>
            <Flag
              rel="preload"
              src={`${baseUrl ? `${baseUrl}/` : ''}flags/${alert.flagState.toLowerCase()}.svg`}
              style={{ marginLeft: 0, marginRight: 5, marginTop: 1, width: 18 }}
              title={countries.getName(alert.flagState.toLowerCase(), 'fr')}
            />
            {alert.vesselName}
          </Ellipsised>
        )
      },
      enableSorting: true,
      header: () => 'Navire',
      id: 'vessel',
      size: 210
    },
    {
      accessorFn: row => row.value.name,
      cell: ({ row }: CellContext<PendingAlert, string>) => {
        const alert = row.original

        return <Ellipsised title={alert.value.description ?? alert.value.name}>{alert.value.name}</Ellipsised>
      },
      enableSorting: true,
      header: () => "Nom de l'alerte",
      id: 'name',
      size: 300
    },
    {
      accessorFn: row => `${row.alertSpecification.natinf}:${row.id}`,
      cell: ({ row }) => {
        const { alertSpecification } = row.original

        return <Ellipsised>{getAlertCriteriaSummary(alertSpecification)}</Ellipsised>
      },
      enableSorting: true,
      header: () => 'Critères de déclenchement',
      id: 'criterias',
      size: 220
    },
    {
      accessorFn: row => row.value.natinfCode,
      cell: ({ row }: CellContext<PendingAlert, string>) => {
        const alert = row.original

        return (
          <Ellipsised>
            {alert.value.threatCharacterization} / NATINF {alert.value.natinfCode}
          </Ellipsised>
        )
      },
      enableSorting: true,
      header: () => 'Type d’infraction',
      id: 'threat',
      size: 200
    },
    {
      accessorFn: row => `${row.id}`,
      cell: ({ row }: CellContext<PendingAlert, string>) => {
        const alert = row.original

        if (!openSilenceAlertMenu) {
          return ''
        }

        return <ActionCell alert={alert} openSilenceAlertMenu={openSilenceAlertMenu} />
      },
      enableSorting: false,
      header: () => '',
      id: 'actions',
      size: 100
    }
  ]
}
