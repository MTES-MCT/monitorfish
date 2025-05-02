import { Ellipsised } from '@components/Ellipsised'
import { BackOfficeIconLink } from '@features/BackOffice/components/BackOfficeIconLink'
import { BackOfficeMenuKey, BackOfficeMenuPath } from '@features/BackOffice/components/BackofficeMenu/constants'
import { Accent, Icon, Size } from '@mtes-mct/monitor-ui'
import { ROUTER_PATHS } from 'paths'

import { getSubscriberPortNames, getSubscriberPortNamesWithAllNotifications } from './utils'

import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'
import type { AccessorColumnDef } from '@tanstack/table-core/build/lib/types'

export const DEFAULT_TABLE_FILTER_VALUES: PriorNotificationSubscriber.ApiListFilter = {
  administrationId: undefined,
  portLocode: undefined,
  searchQuery: undefined,
  withAtLeastOneSubscription: false
}

export const TABLE_COLUMNS: Array<AccessorColumnDef<PriorNotificationSubscriber.Subscriber, any>> = [
  {
    accessorFn: row => `${row.controlUnit.name} (${row.controlUnit.administration.name})`,
    cell: info => <Ellipsised>{info.getValue<string>()}</Ellipsised>,
    enableSorting: true,
    header: () => 'Unité (administration)',
    id: 'name',
    size: 400
  },
  {
    accessorFn: row => row.portSubscriptions,
    cell: getSubscriberPortNames,
    enableSorting: false,
    header: () => 'Ports de diffusion',
    id: 'ports'
  },
  {
    accessorFn: row => row.portSubscriptions,
    cell: getSubscriberPortNamesWithAllNotifications,
    enableSorting: false,
    header: () => 'Ports de diffusion avec préavis supplémentaires',
    id: 'portsWithAllNotifications'
  },
  {
    accessorFn: row => row.controlUnit.id,
    cell: info => (
      <BackOfficeIconLink
        accent={Accent.TERTIARY}
        Icon={Icon.EditUnbordered}
        size={Size.NORMAL}
        title="Éditer la diffusion pour cette unité de contrôle"
        to={`${ROUTER_PATHS.backoffice}/${BackOfficeMenuPath[BackOfficeMenuKey.PRIOR_NOTIFICATION_SUBSCRIBER_TABLE]}/${info.getValue<number>()}`}
      />
    ),
    enableSorting: false,
    header: () => '',
    id: 'edit',
    size: 44
  }
]
