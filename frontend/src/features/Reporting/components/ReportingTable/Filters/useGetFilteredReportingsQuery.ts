import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS, RtkCacheTagType } from '@api/constants'
import { NO_SEAFRONT_GROUP, type NoSeafrontGroup, type SeafrontGroup } from '@constants/seafront'
import { getAlertNameFromType } from '@features/Alert/components/SideWindowAlerts/AlertListAndReportingList/utils'
import { ALERTS_MENU_SEAFRONT_TO_SEAFRONTS, PendingAlertValueType } from '@features/Alert/constants'
import { useGetReportingsQuery } from '@features/Reporting/reportingApi'
import { useHandleFrontendApiError } from '@hooks/useHandleFrontendApiError'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { CustomSearch } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'

import type { InfractionSuspicionReporting, Reporting } from '@features/Reporting/types'

export const useGetFilteredReportingsQuery = (selectedSeafrontGroup: SeafrontGroup | NoSeafrontGroup) => {
  const searchQuery = useMainAppSelector(state => state.reportingTableFilters.searchQuery)
  const reportingTypesDisplayed = useMainAppSelector(state => state.reportingTableFilters.reportingTypesDisplayed)

  const { data, error, isError, isLoading } = useGetReportingsQuery(undefined, RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS)

  useHandleFrontendApiError(DisplayedErrorKey.SIDE_WINDOW_REPORTING_LIST_ERROR, error, RtkCacheTagType.Reportings)

  const currentSeafrontReportings = useMemo(() => {
    const currentReportings = data ?? []

    if (selectedSeafrontGroup === NO_SEAFRONT_GROUP) {
      return currentReportings
        .filter(reporting => !reporting.value.seaFront)
        .filter(reporting => reportingTypesDisplayed.includes(reporting.type))
    }

    return currentReportings
      .filter(
        reporting =>
          ALERTS_MENU_SEAFRONT_TO_SEAFRONTS[selectedSeafrontGroup] &&
          reporting.value.seaFront &&
          ALERTS_MENU_SEAFRONT_TO_SEAFRONTS[selectedSeafrontGroup].seafronts.includes(reporting.value.seaFront)
      )
      .filter(reporting => reportingTypesDisplayed.includes(reporting.type))
  }, [data, selectedSeafrontGroup, reportingTypesDisplayed])

  const fuse = useMemo(
    () =>
      new CustomSearch<Reporting.Reporting>(
        currentSeafrontReportings,
        [
          'vesselName',
          'internalReferenceNumber',
          'externalReferenceNumber',
          'ircs',
          {
            getFn: reporting => reporting.value.dml ?? '',
            name: 'value.dml'
          },
          {
            getFn: reporting => (isInfractionSuspicion(reporting) ? reporting.value.title : ''),
            name: 'value.title'
          },
          {
            getFn: reporting => {
              if (Object.keys(PendingAlertValueType).includes(reporting.value.type)) {
                return getAlertNameFromType(reporting.value.type as PendingAlertValueType)
              }

              return ''
            },
            name: 'value.type'
          }
        ],
        { isCaseSensitive: false, isDiacriticSensitive: false, isStrict: true, threshold: 0.4 }
      ),
    [currentSeafrontReportings]
  )

  const filteredReportings = useMemo(() => {
    if (!currentSeafrontReportings) {
      return []
    }

    if (!searchQuery || searchQuery.length <= 1) {
      return currentSeafrontReportings
    }

    return fuse.find(searchQuery)
  }, [currentSeafrontReportings, searchQuery, fuse])

  return { isError, isLoading, reportings: filteredReportings }
}

function isInfractionSuspicion(reporting: Reporting.Reporting): reporting is InfractionSuspicionReporting {
  return (<InfractionSuspicionReporting>reporting).value.title !== undefined
}
