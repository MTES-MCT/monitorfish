import { SeafrontGroup, seafrontGroupSupportsAbsentVesselFilter } from '@constants/seafront'
import { reportingTableFiltersActions } from '@features/Reporting/components/ReportingTable/Filters/slice'
import { ReportingZoneFilter } from '@features/Reporting/components/ReportingZoneFilter'
import {
  IUU_OPTIONS,
  REPORTING_ORIGIN_AS_OPTIONS,
  REPORTING_SEARCH_PERIOD_AS_OPTIONS,
  REPORTING_TYPE_OPTIONS,
  STATUS_OPTIONS
} from '@features/Reporting/constants'
import {
  getArchivedValue,
  getCustomPeriodValue,
  getIUUValue,
  useReportingsFilters
} from '@features/Reporting/hooks/useReportingsFilters'
import { ReportingSearchPeriod } from '@features/Reporting/types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Checkbox, DateRangePicker, Select, Size, TextInput } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import type { ReportingOrigin } from '@features/Reporting/types/ReportingOrigin'
import type { ReportingType } from '@features/Reporting/types/ReportingType'

type FiltersProps = Readonly<{
  selectedSeafrontGroup: SeafrontGroup
}>
export function Filters({ selectedSeafrontGroup }: FiltersProps) {
  const dispatch = useMainAppDispatch()
  const searchQuery = useMainAppSelector(state => state.reportingTableFilters.searchQuery)
  const absentVesselChecked = useMainAppSelector(state => state.reportingTableFilters.absentVessel)
  const [searchText, setSearchText] = useState(searchQuery)

  const {
    filters,
    updateCustomPeriod,
    updateIsIUU,
    updateOrigin,
    updateReportingPeriod,
    updateReportingStatus,
    updateReportingType
  } = useReportingsFilters()

  const debouncedHandleChange = useDebouncedCallback(
    (value: string | undefined) => {
      dispatch(reportingTableFiltersActions.setSearchQueryFilter(value))
    },
    50,
    { leading: true, maxWait: 250 }
  )

  const handleCheckAbsentVessel = (isChecked: boolean | undefined) => {
    dispatch(reportingTableFiltersActions.setAbsentVessel(!!isChecked))
  }

  const showAbsentVesselToggle = seafrontGroupSupportsAbsentVesselFilter(selectedSeafrontGroup)

  // uncheck absent vessel filter if on a tab that do not supports it
  useEffect(() => {
    if (!showAbsentVesselToggle && absentVesselChecked) {
      dispatch(reportingTableFiltersActions.setAbsentVessel(false))
    }
  }, [absentVesselChecked, dispatch, showAbsentVesselToggle])

  return (
    <Wrapper>
      <Row>
        <StyledSearch
          data-cy="side-window-reporting-search"
          isLabelHidden
          isLight
          isSearchInput
          label="Rechercher dans les signalements"
          name="side-window-reporting-search"
          onChange={value => {
            setSearchText(value)
            debouncedHandleChange(value)
          }}
          placeholder="Rechercher dans les signalements"
          size={Size.LARGE}
          value={searchText}
        />
        <Select
          isCleanable={false}
          isLabelHidden
          isTransparent
          label="Période"
          name="reportingPeriod"
          onChange={value => updateReportingPeriod(value as ReportingSearchPeriod)}
          options={REPORTING_SEARCH_PERIOD_AS_OPTIONS}
          placeholder="Période"
          value={filters.reportingPeriod}
        />
        {filters.reportingPeriod === ReportingSearchPeriod.CUSTOM && (
          <DateRangePicker
            defaultValue={getCustomPeriodValue(filters)}
            hasSingleCalendar
            isCompact
            isLabelHidden
            isStringDate
            label="Période spécifique"
            name="customPeriod"
            onChange={updateCustomPeriod}
            withFullDayDefaults
          />
        )}
        <Select
          isLabelHidden
          isTransparent
          label="Statut"
          name="status"
          onChange={value => updateReportingStatus(value)}
          options={STATUS_OPTIONS}
          placeholder="Statut"
          value={getArchivedValue(filters.isArchived)}
        />
        <Select
          isLabelHidden
          isTransparent
          label="Type de signalement"
          name="reportingType"
          onChange={value => updateReportingType(value as ReportingType | undefined)}
          options={REPORTING_TYPE_OPTIONS}
          placeholder="Type de signalement"
          value={filters.reportingType}
        />
        <Select
          isLabelHidden
          isTransparent
          label="INN / non INN"
          name="isIUU"
          onChange={value => updateIsIUU(value)}
          options={IUU_OPTIONS}
          placeholder="INN / non INN"
          value={getIUUValue(filters.isIUU)}
        />
        <Select
          isLabelHidden
          isTransparent
          label="Source"
          name="origin"
          onChange={value => updateOrigin(value as ReportingOrigin | undefined)}
          options={REPORTING_ORIGIN_AS_OPTIONS}
          placeholder="Source"
          value={filters.origin}
        />
      </Row>
      <Row>
        <StyledReportingZoneFilter />
        {showAbsentVesselToggle && (
          <Checkbox
            checked={absentVesselChecked}
            label="Navires sans fiche"
            name="absentVessel"
            onChange={handleCheckAbsentVessel}
          />
        )}
      </Row>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`

const StyledReportingZoneFilter = styled(ReportingZoneFilter)`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`

const StyledSearch = styled(TextInput)`
  border: 1px solid ${p => p.theme.color.lightGray};
  width: 300px;
`
