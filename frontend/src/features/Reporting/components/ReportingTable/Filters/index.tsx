import { reportingTableFiltersActions } from '@features/Reporting/components/ReportingTable/Filters/slice'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Checkbox, CheckPicker, Size, TextInput } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { REPORTING_TYPE_FILTER_OPTIONS } from './constants'

export function Filters() {
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
    let enrichedNextValue = nextValue
    if (nextValue?.includes(ReportingType.INFRACTION_SUSPICION)) {
      enrichedNextValue = [...nextValue, ReportingType.ALERT]
    }
    dispatch(reportingTableFiltersActions.setReportingTypesDisplayed(enrichedNextValue))
  }

  const handleCheckAbsentVessel = (isChecked: boolean | undefined) => {
    dispatch(reportingTableFiltersActions.setAbsentVessel(!!isChecked))
  }

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
      <StyledCheckPicker
        isLabelHidden
        isTransparent
        label="Type de signalement"
        name="reportingType"
        onChange={updateReportingTypes}
        options={REPORTING_TYPE_FILTER_OPTIONS}
        placeholder="Type de signalement"
        renderValue={(_: unknown, items: unknown[]) =>
          items.length > 0 ? <OptionValue>Type de signalement ({items.length}) </OptionValue> : <></>
        }
        value={reportingTypesDisplayed}
      />
      <StyledCheckbox
        checked={absentVesselChecked}
        label="Navires sans fiche"
        name="absentVessel"
        onChange={handleCheckAbsentVessel}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`

const StyledSearch = styled(TextInput)`
  border: 1px solid ${p => p.theme.color.lightGray};
  width: 300px;
`

const StyledCheckPicker = styled(CheckPicker)`
  margin-left: 24px;
`

const StyledCheckbox = styled(Checkbox)`
  margin-left: 24px;
`

const OptionValue = styled.span`
  display: flex;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
