import { Icon, IconButton, Size } from '@mtes-mct/monitor-ui'

import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'
import type { ColumnDef } from '@tanstack/react-table'

export const PORT_SUBSCRIPTION_TABLE_COLUMNS: Array<ColumnDef<PriorNotificationSubscriber.PortSubscription>> = [
  {
    accessorFn: row => `${row.controlUnitId}-${row.portLocode}`,
    enableSorting: false,
    header: () => 'ID',
    id: 'id',
    size: 64
  },
  {
    accessorFn: row => row.portName,
    header: () => 'Port',
    id: 'portName',
    size: 240
  },
  {
    accessorFn: row => row.portLocode,
    cell: () => <IconButton Icon={Icon.Edit} size={Size.SMALL} title="Désinsrire l'unité de ce port" />,
    enableSorting: false,
    header: () => '',
    id: 'unsubscribe',
    size: 44
  }
]
