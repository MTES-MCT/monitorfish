import { reportingTableFiltersActions } from '@features/Reporting/components/ReportingTable/Filters/slice'
import { ZoneFilterTags } from '@features/Reporting/components/ZoneFilter/ZoneFilterTags'
import {
  IUU_OPTIONS,
  REPORTING_ORIGIN_LABEL,
  REPORTING_SEARCH_PERIOD_LABEL,
  REPORTING_TYPE_OPTIONS,
  STATUS_OPTIONS
} from '@features/Reporting/constants'
import { getArchivedValue, getIUUValue, useReportingsFilters } from '@features/Reporting/hooks/useReportingsFilters'
import { DEFAULT_REPORTINGS_FILTER } from '@features/Reporting/slice'
import { ReportingSearchPeriod, type ReportingsFilter } from '@features/Reporting/types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customDayjs, SingleTag } from '@mtes-mct/monitor-ui'

function getPeriodLabel({ endDate, reportingPeriod, startDate }: ReportingsFilter): string {
  if (reportingPeriod === ReportingSearchPeriod.CUSTOM && startDate && endDate) {
    return `du ${formatDate(startDate)} au ${formatDate(endDate)}`
  }

  return REPORTING_SEARCH_PERIOD_LABEL[reportingPeriod]
}

function formatDate(date: string): string {
  return customDayjs(date).utc().format('DD/MM/YYYY')
}

function findLabel(options: Array<{ label: string; value: string }>, value: string | undefined): string | undefined {
  return options.find(option => option.value === value)?.label
}

export function FilterTags() {
  const dispatch = useMainAppDispatch()
  const absentVessel = useMainAppSelector(state => state.reportingTableFilters.absentVessel)
  const { filters, resetReportingPeriod, updateIsIUU, updateOrigin, updateReportingStatus, updateReportingType } =
    useReportingsFilters()

  const removeAbsentVessel = () => {
    dispatch(reportingTableFiltersActions.setAbsentVessel(false))
  }

  const periodLabel =
    filters.reportingPeriod !== DEFAULT_REPORTINGS_FILTER.reportingPeriod ? getPeriodLabel(filters) : undefined
  const originLabel = filters.origin ? REPORTING_ORIGIN_LABEL[filters.origin] : undefined
  const statusLabel = findLabel(STATUS_OPTIONS, getArchivedValue(filters.isArchived))
  const reportingTypeLabel = findLabel(REPORTING_TYPE_OPTIONS, filters.reportingType)
  const iuuLabel = findLabel(IUU_OPTIONS, getIUUValue(filters.isIUU))

  return (
    <>
      {!!periodLabel && <SingleTag onDelete={resetReportingPeriod}>{`Période : ${periodLabel}`}</SingleTag>}
      {!!originLabel && <SingleTag onDelete={() => updateOrigin(undefined)}>{`Source : ${originLabel}`}</SingleTag>}
      {!!statusLabel && (
        <SingleTag onDelete={() => updateReportingStatus(undefined)}>{`Statut : ${statusLabel}`}</SingleTag>
      )}
      {!!reportingTypeLabel && (
        <SingleTag onDelete={() => updateReportingType(undefined)}>
          {`Type de signalement : ${reportingTypeLabel}`}
        </SingleTag>
      )}
      {!!iuuLabel && <SingleTag onDelete={() => updateIsIUU(undefined)}>{iuuLabel}</SingleTag>}
      {!!absentVessel && <SingleTag onDelete={removeAbsentVessel}>Navires sans fiche</SingleTag>}
      <ZoneFilterTags />
    </>
  )
}
