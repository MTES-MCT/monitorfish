import { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../../constants/constants'
import Filter from './Filter'
import {
  hideFilters,
  removeFilter,
  removeTagFromFilter,
  setNonFilteredVesselsAreHidden,
  showFilter
} from '../../../domain/shared_slices/Filter'
import FilterParameters from './FilterParameters'
import { MapToolType } from '../../../domain/entities/map/constants'
import { MapToolBox } from '../shared/MapToolBox'

const Filters = () => {
  const dispatch = useDispatch()
  const {
    filters,
    nonFilteredVesselsAreHidden
  } = useSelector(state => state.filter)
  const {
    healthcheckTextWarning,
    mapToolOpened
  } = useSelector(state => state.global)

  const isOpen = useMemo(() => mapToolOpened === MapToolType.FILTERS, [mapToolOpened])

  const removeFilterCallback = useCallback(filterUUID => {
    dispatch(removeFilter(filterUUID))
  }, [])

  const showFilterCallback = useCallback(filterUUID => {
    dispatch(showFilter(filterUUID))
  }, [])

  const hideFiltersCallback = useCallback(() => {
    dispatch(hideFilters())
  }, [])

  const removeTagFromFilterCallback = useCallback(removeObject => {
    dispatch(removeTagFromFilter(removeObject))
  }, [])

  const setNonFilteredVesselsAreHiddenCallback = useCallback(areHidden => {
    dispatch(setNonFilteredVesselsAreHidden(areHidden))
  }, [])

  return (
    <VesselFilterBox
      healthcheckTextWarning={healthcheckTextWarning}
      isOpen={isOpen}>
      <Header isFirst={true}>
        Mes filtres
      </Header>
      {
        filters && filters.length
          ? <FiltersSelectedList>
            {
              filters
                .map((filter, index) => {
                  return <Filter
                    key={filter.uuid}
                    index={index + 1}
                    filter={filter}
                    isLastItem={filters.length === index + 1}
                    removeFilter={removeFilterCallback}
                    showFilter={showFilterCallback}
                    hideFilters={hideFiltersCallback}
                    removeTagFromFilter={removeTagFromFilterCallback}
                  />
                })
            }
          </FiltersSelectedList>
          : <LastPositionInfo>
            Aucun filtre
          </LastPositionInfo>
      }
      <FilterParameters
        setNonFilteredVesselsAreHidden={setNonFilteredVesselsAreHiddenCallback}
        nonFilteredVesselsAreHidden={nonFilteredVesselsAreHidden}
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

const Header = styled.div`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
  border-top-left-radius: ${props => props.isFirst ? '2px' : '0'};
  border-top-right-radius: ${props => props.isFirst ? '2px' : '0'};
`

const VesselFilterBox = styled(MapToolBox)`
  width: 305px;
  top: 110px;
`

export default Filters
