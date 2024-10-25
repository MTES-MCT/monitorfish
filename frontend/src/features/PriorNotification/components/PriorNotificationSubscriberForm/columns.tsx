import { Icon, IconButton, Size } from '@mtes-mct/monitor-ui'

import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { Promisable } from 'type-fest'

export function getPortSubscriptionTableColumns(
  onRemove: (portLocodeToRemove: string) => Promisable<void>,
  isDisabled: boolean
): Array<ColumnDef<PriorNotificationSubscriber.PortSubscription, any>> {
  return [
    {
      accessorFn: row => row.portName,
      header: () => 'Port',
      id: 'portName'
    },
    {
      accessorFn: row => row.portLocode,
      cell: (context: CellContext<PriorNotificationSubscriber.PortSubscription, string>) => (
        <IconButton
          disabled={isDisabled}
          Icon={Icon.Delete}
          onClick={() => onRemove(context.getValue())}
          size={Size.SMALL}
          title="Désinsrire l'unité des préavis liés à ce port"
        />
      ),
      enableSorting: false,
      header: () => '',
      id: 'remove',
      size: 44
    }
  ]
}

export function getSegmentSubscriptionTableColumns(
  onRemove: (segmentCodeToRemove: string) => Promisable<void>,
  isDisabled: boolean
): Array<ColumnDef<PriorNotificationSubscriber.SegmentSubscription, any>> {
  return [
    {
      accessorFn: row => `${row.segmentCode} (${row.segmentName})`,
      header: () => 'Segment',
      id: 'name'
    },
    {
      accessorFn: row => row.segmentCode,
      cell: (context: CellContext<PriorNotificationSubscriber.SegmentSubscription, string>) => (
        <IconButton
          disabled={isDisabled}
          Icon={Icon.Delete}
          onClick={() => onRemove(context.getValue())}
          size={Size.SMALL}
          title="Désinsrire l'unité des préavis liés à ce segment de flotte"
        />
      ),
      enableSorting: false,
      header: () => '',
      id: 'remove',
      size: 44
    }
  ]
}

export function getVesselSubscriptionTableColumns(
  onRemove: (vesselIdToRemove: number) => Promisable<void>,
  isDisabled: boolean
): Array<ColumnDef<PriorNotificationSubscriber.VesselSubscription, any>> {
  return [
    {
      accessorFn: row => row.vesselName,
      header: () => 'Navire',
      id: 'vesselName'
    },
    {
      accessorFn: row => row.vesselId,
      cell: (context: CellContext<PriorNotificationSubscriber.VesselSubscription, number>) => (
        <IconButton
          disabled={isDisabled}
          Icon={Icon.Delete}
          onClick={() => onRemove(context.getValue())}
          size={Size.SMALL}
          title="Désinsrire l'unité des préavis liés à ce navire"
        />
      ),
      enableSorting: false,
      header: () => '',
      id: 'remove',
      size: 44
    }
  ]
}
