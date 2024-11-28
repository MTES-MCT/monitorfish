import { reportingTableFiltersActions } from '@features/Reporting/components/ReportingTable/Filters/slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Size, TextInput } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

export function SearchFilter() {
  const dispatch = useMainAppDispatch()
  const searchQuery = useMainAppSelector(state => state.reportingTableFilters.searchQuery)
  const [searchText, setSearchText] = useState(searchQuery)

  const debouncedHandleChange = useDebouncedCallback((value: string | undefined) => {
    dispatch(reportingTableFiltersActions.setSearchQueryFilter(value))
  }, 250)

  return (
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
  )
}

const StyledSearch = styled(TextInput)`
  border: 1px solid ${p => p.theme.color.lightGray};
  width: 300px;
`
