import { setInteractionTypeAndListener } from '@features/Draw/slice'
import { InteractionListener, InteractionType } from '@features/Map/constants'
import { openDrawLayerModal } from '@features/Mission/useCases/addOrEditMissionZone'
import { reportingActions } from '@features/Reporting/slice'
import { useListenForDrawedGeometry } from '@hooks/useListenForDrawing'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { GeoJSON, WKT } from 'ol/format'
import { useEffect } from 'react'

import type { ReportingsFilter } from '@features/Reporting/types'
import type { ReportingOrigin } from '@features/Reporting/types/ReportingOrigin'
import type { ReportingType } from '@features/Reporting/types/ReportingType'
import type { DateAsStringRange } from '@mtes-mct/monitor-ui/types/definitions'
import type { Geometry } from 'geojson'

const geoJSONFormat = new GeoJSON()
const wktFormat = new WKT()

/** The drawn geometry is stored as WGS84 GeoJSON, which is also what the backend expects. */
function toWkt(geometry: Geometry): string {
  return wktFormat.writeGeometry(geoJSONFormat.readGeometry(geometry))
}

function toIsArchived(value: string | undefined): boolean | undefined {
  if (value === 'ARCHIVED') {
    return true
  }
  if (value === 'NOT_ARCHIVED') {
    return false
  }

  return undefined
}

function toIsIUU(value: string | undefined): boolean | undefined {
  if (value === 'IUU') {
    return true
  }
  if (value === 'NOT_IUU') {
    return false
  }

  return undefined
}

/**
 * The filters shared by the reporting map menu and the reporting list.
 *
 * Both views read and write the same slice, so a change on one side is immediately reflected on
 * the other, with no synchronization code.
 */
export function useReportingsFilters() {
  const dispatch = useMainAppDispatch()
  const filters = useMainAppSelector(state => state.reporting.filters)

  const { drawedGeometry } = useListenForDrawedGeometry(InteractionListener.REPORTINGS_ZONE)

  const applyFilter = (nextFilter: Partial<ReportingsFilter>) => {
    dispatch(reportingActions.setFilters({ ...filters, ...nextFilter }))
  }

  useEffect(() => {
    if (!drawedGeometry) {
      return
    }

    dispatch(
      reportingActions.setFilters({
        ...filters,
        zone: toWkt(drawedGeometry)
      })
    )
    // `filters` is intentionally left out: re-running on every filter change would re-apply a
    // stale drawn geometry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, drawedGeometry])

  return {
    drawZone: () => {
      dispatch(openDrawLayerModal)
      dispatch(
        setInteractionTypeAndListener({
          listener: InteractionListener.REPORTINGS_ZONE,
          type: InteractionType.POLYGON
        })
      )
    },

    filters,

    updateCustomPeriod: (nextCustomPeriod: DateAsStringRange | undefined) =>
      applyFilter({ endDate: nextCustomPeriod?.[1], startDate: nextCustomPeriod?.[0] }),

    updateIsIUU: (nextValue: string | undefined) => applyFilter({ isIUU: toIsIUU(nextValue) }),

    updateOrigin: (nextOrigin: ReportingOrigin | undefined) => applyFilter({ origin: nextOrigin }),

    updateReportingPeriod: (nextReportingPeriod: ReportingsFilter['reportingPeriod']) =>
      applyFilter({ reportingPeriod: nextReportingPeriod }),

    updateReportingStatus: (nextValue: string | undefined) => applyFilter({ isArchived: toIsArchived(nextValue) }),

    updateReportingType: (nextReportingType: ReportingType | undefined) =>
      applyFilter({ reportingType: nextReportingType }),

    updateZone: (nextZone: string | undefined) => applyFilter({ zone: nextZone })
  }
}

/** `undefined` when the filter is not set, so that the `Select` shows its placeholder. */
export function getArchivedValue(isArchived: boolean | undefined): string | undefined {
  if (isArchived === undefined) {
    return undefined
  }

  return isArchived ? 'ARCHIVED' : 'NOT_ARCHIVED'
}

export function getIUUValue(isIUU: boolean | undefined): string | undefined {
  if (isIUU === undefined) {
    return undefined
  }

  return isIUU ? 'IUU' : 'NOT_IUU'
}

export function getCustomPeriodValue(filters: ReportingsFilter): DateAsStringRange | undefined {
  return filters.startDate && filters.endDate ? [filters.startDate, filters.endDate] : undefined
}
