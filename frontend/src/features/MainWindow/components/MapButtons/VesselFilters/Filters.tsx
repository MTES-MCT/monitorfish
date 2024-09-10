import { COLORS } from '@constants/constants'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { Filter } from './Filter'
import { FilterParameters } from './FilterParameters'
import { MapBox } from '../../../../../domain/entities/map/constants'
import {
  hideFilters,
  removeFilter,
  removeTagFromFilter,
  setNonFilteredVesselsAreHidden,
  showFilter
} from '../../../../../domain/shared_slices/Filter'
import { MapToolBox } from '../shared/MapToolBox'

export function Filters() {
  const dispatch = useMainAppDispatch()
  const { filters, nonFilteredVesselsAreHidden } = useMainAppSelector(state => state.filter)
  const rightMapBoxOpened = useMainAppSelector(state => state.mainWindow.rightMapBoxOpened)

  const isOpen = useMemo(() => rightMapBoxOpened === MapBox.FILTERS, [rightMapBoxOpened])

  const removeFilterCallback = useCallback(
    filterUUID => {
      dispatch(removeFilter(filterUUID))
    },
    [dispatch]
  )

  const showFilterCallback = useCallback(
    filterUUID => {
      dispatch(showFilter(filterUUID))
    },
    [dispatch]
  )

  const hideFiltersCallback = useCallback(() => {
    dispatch(hideFilters())
  }, [dispatch])

  const removeTagFromFilterCallback = useCallback(
    removeObject => {
      dispatch(removeTagFromFilter(removeObject))
    },
    [dispatch]
  )

  const setNonFilteredVesselsAreHiddenCallback = useCallback(
    areHidden => {
      dispatch(setNonFilteredVesselsAreHidden(areHidden))
    },
    [dispatch]
  )

  return (
    <VesselFilterBox $isOpen={isOpen}>
      <Header $isFirst>Mes filtres</Header>
      {filters.length > 0 ? (
        <FiltersSelectedList>
          {filters.map((filter, index) => (
            <Filter
              key={filter.uuid}
              filter={filter}
              hideFilters={hideFiltersCallback}
              index={index + 1}
              isLastItem={filters.length === index + 1}
              removeFilter={removeFilterCallback}
              removeTagFromFilter={removeTagFromFilterCallback}
              showFilter={showFilterCallback}
            />
          ))}
        </FiltersSelectedList>
      ) : (
        <LastPositionInfo>Aucun filtre</LastPositionInfo>
      )}
      <FilterParameters
        nonFilteredVesselsAreHidden={nonFilteredVesselsAreHidden}
        setNonFilteredVesselsAreHidden={setNonFilteredVesselsAreHiddenCallback}
      />
    </VesselFilterBox>
  )
}

const FiltersSelectedList = styled.ul`
  margin: 0;
  background-color: ${COLORS.white};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  max-height: 550px;
  overflow-x: hidden;
  color: ${COLORS.gunMetal};
`

const LastPositionInfo = styled.div`
  font-size: 13px;
  margin: 15px;
  color: ${COLORS.gunMetal};
`

const Header = styled.div<{
  $isFirst: boolean
}>`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
  border-top-left-radius: ${p => (p.$isFirst ? '2px' : '0')};
  border-top-right-radius: ${p => (p.$isFirst ? '2px' : '0')};
`

const VesselFilterBox = styled(MapToolBox)`
  width: 305px;
  top: 124px;
`
