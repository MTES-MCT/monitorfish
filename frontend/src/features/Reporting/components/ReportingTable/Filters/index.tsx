import { ResetButton } from '@components/ResetButton'
import { SeafrontGroup, seafrontGroupSupportsAbsentVesselFilter } from '@constants/seafront'
import { reportingTableFiltersActions } from '@features/Reporting/components/ReportingTable/Filters/slice'
import { DrawZoneFilterButton } from '@features/Reporting/components/ZoneFilter/DrawZoneFilterButton'
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
import { DEFAULT_REPORTINGS_FILTER } from '@features/Reporting/slice'
import { ReportingSearchPeriod } from '@features/Reporting/types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Checkbox, DateRangePicker, Icon, LinkButton, Select, Size, TextInput, THEME } from '@mtes-mct/monitor-ui'
import { isEqual } from 'lodash-es'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { FilterTags } from './FilterTags'

type FiltersProps = Readonly<{
  selectedSeafrontGroup: SeafrontGroup
}>
export function Filters({ selectedSeafrontGroup }: FiltersProps) {
  const dispatch = useMainAppDispatch()
  const searchQuery = useMainAppSelector(state => state.reportingTableFilters.searchQuery)
  const absentVesselChecked = useMainAppSelector(state => state.reportingTableFilters.absentVessel)
  const areFiltersDisplayed = useMainAppSelector(state => state.reportingTableFilters.areFiltersDisplayed)
  const [searchText, setSearchText] = useState(searchQuery)

  const {
    filters,
    resetFilters,
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

  const toggleFiltersDisplay = () => {
    dispatch(reportingTableFiltersActions.setAreFiltersDisplayed(!areFiltersDisplayed))
  }

  const resetAllFilters = () => {
    resetFilters()
    dispatch(reportingTableFiltersActions.setAbsentVessel(false))
  }

  const showAbsentVesselToggle = seafrontGroupSupportsAbsentVesselFilter(selectedSeafrontGroup)
  const hasActiveFilters = !isEqual(filters, DEFAULT_REPORTINGS_FILTER) || !!absentVesselChecked

  // uncheck absent vessel filter if on a tab that do not supports it
  useEffect(() => {
    if (!showAbsentVesselToggle && absentVesselChecked) {
      dispatch(reportingTableFiltersActions.setAbsentVessel(false))
    }
  }, [absentVesselChecked, dispatch, showAbsentVesselToggle])

  return (
    <Wrapper data-cy="reporting-table-filters">
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
        <ShowFiltersButton onClick={toggleFiltersDisplay}>
          <Icon.FilterBis color={THEME.color.charcoal} size={20} />
          {areFiltersDisplayed ? 'Masquer les filtres' : 'Afficher les filtres'}
        </ShowFiltersButton>
      </Row>
      {areFiltersDisplayed && (
        <>
          <Row>
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
              label="Source"
              name="origin"
              onChange={value => updateOrigin(value)}
              options={REPORTING_ORIGIN_AS_OPTIONS}
              placeholder="Source"
              value={filters.origin}
            />
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
              onChange={value => updateReportingType(value)}
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
            <DrawZoneFilterButton />
          </Row>
          {showAbsentVesselToggle && (
            <Row>
              <Checkbox
                checked={absentVesselChecked}
                label="Navires sans fiche"
                name="absentVessel"
                onChange={handleCheckAbsentVessel}
              />
            </Row>
          )}
        </>
      )}
      {hasActiveFilters && (
        <TagsRow>
          <FilterTags />
          <ResetButton data-cy="reporting-table-reset-filters" onClick={resetAllFilters} />
        </TagsRow>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 1290px; /* = table width */
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;

  > .Field-MultiCascader,
  > .Field-CheckPicker,
  > .Field-Select,
  > .Element-Fieldset {
    min-width: 200px;
    width: 160px;
  }
`

const TagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`

const ShowFiltersButton = styled(LinkButton)`
  color: ${p => p.theme.color.charcoal};
`

const StyledSearch = styled(TextInput)`
  border: 1px solid ${p => p.theme.color.lightGray};
  width: 300px;
`
