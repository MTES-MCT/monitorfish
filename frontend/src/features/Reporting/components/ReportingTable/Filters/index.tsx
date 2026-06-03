import { SeafrontGroup, seafrontGroupSupportsAbsentVesselFilter } from '@constants/seafront'
import { reportingTableFiltersActions } from '@features/Reporting/components/ReportingTable/Filters/slice'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Checkbox, Select, Size, TextInput } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { REPORTING_TYPE_FILTER_OPTIONS } from './constants'

type FiltersProps = Readonly<{
  selectedSeafrontGroup: SeafrontGroup
}>
export function Filters({ selectedSeafrontGroup }: FiltersProps) {
  const dispatch = useMainAppDispatch()
  const searchQuery = useMainAppSelector(state => state.reportingTableFilters.searchQuery)
  const reportingTypesDisplayed = useMainAppSelector(state => state.reportingTableFilters.reportingTypesDisplayed)
  const absentVesselChecked = useMainAppSelector(state => state.reportingTableFilters.absentVessel)
  const [searchText, setSearchText] = useState(searchQuery)

  const debouncedHandleChange = useDebouncedCallback(
    (value: string | undefined) => {
      dispatch(reportingTableFiltersActions.setSearchQueryFilter(value))
    },
    50,
    { leading: true, maxWait: 250 }
  )

  const updateReportingTypes = (nextValue: ReportingType[] | undefined) => {
    dispatch(reportingTableFiltersActions.setReportingTypesDisplayed(nextValue))
  }

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
        isLabelHidden
        isTransparent
        label="Type de signalement"
        name="reportingType"
        onChange={updateReportingTypes}
        options={REPORTING_TYPE_FILTER_OPTIONS}
        // @ts-expect-error: using the number 0 as key is ignored, see https://github.com/MTES-MCT/monitor-ui/issues/2068
        optionValueKey="0"
        placeholder="Type de signalement"
        value={reportingTypesDisplayed}
      />
      {showAbsentVesselToggle && (
        <Checkbox
          checked={absentVesselChecked}
          label="Navires sans fiche"
          name="absentVessel"
          onChange={handleCheckAbsentVessel}
        />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`

const StyledSearch = styled(TextInput)`
  border: 1px solid ${p => p.theme.color.lightGray};
  width: 300px;
`
