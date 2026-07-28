import { useDisplayReportingsQuery } from '@features/Reporting/reportingApi'
import { ReportingSearchPeriod } from '@features/Reporting/types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useMemo } from 'react'

/**
 * Fetches, by id and with no filter applied, the reportings that must stay visible on the main window map
 * regardless of the current filter panel: the one selected on the map (e.g. via "voir sur la carte") and the
 * one being edited from the map's own form.
 *
 * Called with the exact same (redux-derived) args from every consumer, so RTK Query dedupes them into a
 * single request/cache entry instead of each consumer fetching its own copy.
 */
export function usePinnedReportings() {
  const editedReporting = useMainAppSelector(state => state.reporting.editedReporting)
  const isReportingMapFormDisplayed = useMainAppSelector(state => state.displayedComponent.isReportingMapFormDisplayed)
  const selectedReportingFeatureId = useMainAppSelector(state => state.reporting.selectedReportingFeatureId)

  const selectedReportingId = useMemo(() => {
    if (!selectedReportingFeatureId) {
      return undefined
    }

    const id = Number(selectedReportingFeatureId.split(':').at(-1))

    return Number.isNaN(id) ? undefined : id
  }, [selectedReportingFeatureId])

  const editedReportingId = isReportingMapFormDisplayed ? editedReporting?.id : undefined

  const pinnedReportingIds = useMemo(
    () => Array.from(new Set([editedReportingId, selectedReportingId].filter(id => id !== undefined))),
    [editedReportingId, selectedReportingId]
  )

  const { data: pinnedReportings, error: pinnedReportingsError } = useDisplayReportingsQuery({
    endDate: undefined,
    ids: pinnedReportingIds,
    isArchived: undefined,
    isIUU: undefined,
    reportingPeriod: ReportingSearchPeriod.CUSTOM,
    reportingType: undefined,
    startDate: undefined
  })

  return { pinnedReportings, pinnedReportingsError, selectedReportingId }
}
