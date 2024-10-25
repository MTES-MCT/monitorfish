import { BackendApi } from '@api/BackendApi.types'
import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { BackOfficeBody } from '@features/BackOffice/components/BackofficeBody'
import { BackOfficeTitle } from '@features/BackOffice/components/BackOfficeTitle'
import { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'
import { useGetPriorNotificationSubscribersQuery } from '@features/PriorNotification/priorNotificationSubscriberApi'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { DataTable } from '@mtes-mct/monitor-ui'

import { TABLE_COLUMNS } from './constants'
import { FilterBar } from './FilterBar'

export function PriorNotificationSubscriberTable() {
  const tableFilterValues = useBackofficeAppSelector(store => store.priorNotification.tableFilterValues)

  const apiSortingParams: BackendApi.RequestSortingParams<PriorNotificationSubscriber.ApiSortColumn> = {
    sortColumn: PriorNotificationSubscriber.ApiSortColumn.CONTROL_UNIT_NAME,
    sortDirection: BackendApi.SortDirection.ASC
  }

  const rtkQueryParams = {
    ...apiSortingParams,
    ...tableFilterValues
  }
  const { data: subscribers } = useGetPriorNotificationSubscribersQuery(
    rtkQueryParams,
    RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS
  )

  return (
    <BackOfficeBody>
      <BackOfficeTitle>Diffusion des préavis auprès des unités de contrôle</BackOfficeTitle>

      <FilterBar />

      <DataTable columns={TABLE_COLUMNS} data={subscribers} initialSorting={[{ desc: false, id: 'name' }]} />
    </BackOfficeBody>
  )
}
