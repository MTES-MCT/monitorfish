import { COLORS } from '@constants/constants'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

import { Filter } from './Filter'
import { FilterParameters } from './FilterParameters'
import { MapToolBox } from '../../../MainWindow/components/MapButtons/shared/MapToolBox'

export function Filters({ isOpened }) {
  const filters = useMainAppSelector(state => state.filter.filters)

  return (
    <VesselFilterBox $isOpen={isOpened}>
      <Header $isFirst>Mes filtres</Header>
      {filters.length > 0 ? (
        <FiltersSelectedList>
          {filters.map((filter, index) => (
            <Filter key={filter.uuid} filter={filter} index={index + 1} isLastItem={filters.length === index + 1} />
          ))}
        </FiltersSelectedList>
      ) : (
        <LastPositionInfo>Aucun filtre</LastPositionInfo>
      )}
      <FilterParameters />
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
