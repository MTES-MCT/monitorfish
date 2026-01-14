import { reportingTableFiltersActions } from '@features/Reporting/components/ReportingTable/Filters/slice'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Checkbox, Size, TextInput } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

export function Filters() {
  const dispatch = useMainAppDispatch()
  const searchQuery = useMainAppSelector(state => state.reportingTableFilters.searchQuery)
  const reportingTypesDisplayed = useMainAppSelector(state => state.reportingTableFilters.reportingTypesDisplayed)
  const [searchText, setSearchText] = useState(searchQuery)
  const infractionSuspicionTypes = [ReportingType.INFRACTION_SUSPICION, ReportingType.ALERT]

  const debouncedHandleChange = useDebouncedCallback(
    (value: string | undefined) => {
      dispatch(reportingTableFiltersActions.setSearchQueryFilter(value))
    },
    50,
    { leading: true, maxWait: 250 }
  )

  const handleCheckInfractionSuspicion = (isChecked: boolean | undefined) => {
    if (isChecked) {
      const nextValue = reportingTypesDisplayed.concat(infractionSuspicionTypes)
      dispatch(reportingTableFiltersActions.setReportingTypesDisplayed(nextValue))

      return
    }

    const nextValue = reportingTypesDisplayed.filter(type => !infractionSuspicionTypes.includes(type))
    dispatch(reportingTableFiltersActions.setReportingTypesDisplayed(nextValue))
  }

  const handleCheckObservation = (isChecked: boolean | undefined) => {
    if (isChecked) {
      const nextValue = reportingTypesDisplayed.concat(ReportingType.OBSERVATION)
      dispatch(reportingTableFiltersActions.setReportingTypesDisplayed(nextValue))

      return
    }

    const nextValue = reportingTypesDisplayed.filter(type => type !== ReportingType.OBSERVATION)
    dispatch(reportingTableFiltersActions.setReportingTypesDisplayed(nextValue))
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
      <StyledCheckbox
        checked={reportingTypesDisplayed.includes(ReportingType.INFRACTION_SUSPICION)}
        label="Suspicions d'infraction"
        name="infractionSuspicion"
        onChange={handleCheckInfractionSuspicion}
      />
      <StyledCheckbox
        checked={reportingTypesDisplayed.includes(ReportingType.OBSERVATION)}
        label="Observations"
        name="observation"
        onChange={handleCheckObservation}
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

const StyledCheckbox = styled(Checkbox)`
  margin-left: 16px;
`
