import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS, RtkCacheTagType } from '@api/constants'
import { filterBySeafrontGroup, SeafrontGroup } from '@constants/seafront'
import { useGetReportingsQuery } from '@features/Reporting/reportingApi'
import { useHandleFrontendApiError } from '@hooks/useHandleFrontendApiError'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { CustomSearch } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'

import type { InfractionSuspicionReporting, ObservationReporting, Reporting } from '@features/Reporting/types'

export const useGetFilteredReportingsQuery = (selectedSeafrontGroup: SeafrontGroup) => {
  const searchQuery = useMainAppSelector(state => state.reportingTableFilters.searchQuery)
  const reportingTypesDisplayed = useMainAppSelector(state => state.reportingTableFilters.reportingTypesDisplayed)

  const { data, error, isError, isLoading } = useGetReportingsQuery(undefined, RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS)

  useHandleFrontendApiError(DisplayedErrorKey.SIDE_WINDOW_REPORTING_LIST_ERROR, error, RtkCacheTagType.Reportings)

  const currentSeafrontReportings = useMemo(() => {
    const currentReportings = data ?? []

    return filterBySeafrontGroup(currentReportings, selectedSeafrontGroup, r => r.value.seaFront).filter(reporting =>
      reportingTypesDisplayed.includes(reporting.type)
    )
  }, [data, selectedSeafrontGroup, reportingTypesDisplayed])

  const fuse = useMemo(
    () =>
      new CustomSearch<Reporting.Reporting>(
        structuredClone(currentSeafrontReportings),
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
            getFn: reporting => (!isObservation(reporting) ? reporting.value.threatCharacterization : ''),
            name: 'value.threatCharacterization'
          },
          {
            getFn: reporting => (!isObservation(reporting) ? reporting.value.threat : ''),
            name: 'value.threat'
          },
          'value.name'
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

function isObservation(reporting: Reporting.Reporting): reporting is ObservationReporting {
  return (<InfractionSuspicionReporting>reporting).value.threat === undefined
}
