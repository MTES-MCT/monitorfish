import {
  RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS,
  RTK_FORCE_REFETCH_QUERY_OPTIONS,
  RtkCacheTagType
} from '@api/constants'
import { useGetReportingsQuery } from '@features/Reporting/reportingApi'
import { useHandleFrontendApiError } from '@hooks/useHandleFrontendApiError'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import type { BackendApi } from '@api/BackendApi.types'
import type { SeafrontGroup } from '@constants/seafront'
import type { ReportingsFilter, ReportingsSortColumn } from '@features/Reporting/types'

type UseGetFilteredReportingsQueryArgs = {
  apiPaginationParams: BackendApi.RequestPaginationParams
  apiSortingParams: BackendApi.RequestSortingParams<typeof ReportingsSortColumn>
  selectedSeafrontGroup: SeafrontGroup
}
export const useGetFilteredReportingsQuery = ({
  apiPaginationParams,
  apiSortingParams,
  selectedSeafrontGroup
}: UseGetFilteredReportingsQueryArgs) => {
  const filters = useMainAppSelector(state => state.reporting.filters)
  const searchQuery = useMainAppSelector(state => state.reportingTableFilters.searchQuery)
  const absentVessel = useMainAppSelector(state => state.reportingTableFilters.absentVessel)

  const { data, error, isError, isFetching, isLoading } = useGetReportingsQuery(
    {
      apiPaginationParams,
      apiSortingParams,
      filters,
      listFilter: { absentVessel, seafrontGroup: selectedSeafrontGroup, searchQuery }
    },
    { ...RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS, ...RTK_FORCE_REFETCH_QUERY_OPTIONS }
  )

  useHandleFrontendApiError(DisplayedErrorKey.SIDE_WINDOW_REPORTING_LIST_ERROR, error, RtkCacheTagType.Reportings)

  return {
    extraData: data?.extraData,
    isError,
    isFetching,
    isLoading,
    reportings: data?.data,
    totalLength: data?.totalLength
  }
}

/** The filter values that must reset the pagination back to its first page when they change. */
export function useReportingsListFilter(selectedSeafrontGroup: SeafrontGroup) {
  const filters = useMainAppSelector(state => state.reporting.filters)
  const searchQuery = useMainAppSelector(state => state.reportingTableFilters.searchQuery)
  const absentVessel = useMainAppSelector(state => state.reportingTableFilters.absentVessel)

  return { absentVessel, filters, searchQuery, selectedSeafrontGroup } satisfies {
    absentVessel: true | undefined
    filters: ReportingsFilter
    searchQuery: string | undefined
    selectedSeafrontGroup: SeafrontGroup
  }
}
