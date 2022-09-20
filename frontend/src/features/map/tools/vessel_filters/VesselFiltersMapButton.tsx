import { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { MapTool } from '../../../../domain/entities/map'
import { setMapToolOpened } from '../../../../domain/shared_slices/Global'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { useClickOutsideWhenOpened } from '../../../../hooks/useClickOutsideWhenOpened'
import { usePrevious } from '../../../../hooks/usePrevious'
import { ReactComponent as FilterSVG } from '../../../icons/standardized/Filter.svg'
import { MapToolButton } from '../MapToolButton'
import Filters from './Filters'

export function VesselFiltersMapButton() {
  const dispatch = useAppDispatch()
  const { filters } = useAppSelector(state => state.filter)
  const { mapToolOpened } = useAppSelector(state => state.global)
  const previousFilters = usePrevious(filters)
  const rightMenuIsOpen = useAppSelector(state => state.global.rightMenuIsOpen)

  const isRightMenuShrinked = !rightMenuIsOpen
  const isOpen = useMemo(() => mapToolOpened === MapTool.FILTERS, [mapToolOpened])
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, isOpen)

  useEffect(() => {
    if (clickedOutsideComponent) {
      dispatch(setMapToolOpened(undefined))
    }
  }, [clickedOutsideComponent])

  const openOrCloseVesselFilters = useCallback(() => {
    if (isOpen) {
      dispatch(setMapToolOpened(undefined))
    } else {
      dispatch(setMapToolOpened(MapTool.FILTERS))
    }
  }, [dispatch, isOpen])

  const hasOneFilterAdded = useCallback(
    () =>
      // @ts-ignore
      !!(previousFilters && filters.length && filters.length > previousFilters.length),
    [previousFilters, filters]
  )

  return (
    <>
      <Wrapper ref={wrapperRef}>
        <VesselFiltersButton
          dataCy="vessel-filters"
          isOpen={isOpen}
          onClick={openOrCloseVesselFilters}
          style={{ top: 110 }}
          title="Mes filtres"
        >
          <FilterIcon $isRightMenuShrinked={isRightMenuShrinked} />
        </VesselFiltersButton>
        <Filters />
      </Wrapper>
      <NewFilterAdded hasOneFilterAdded={hasOneFilterAdded()}>1 filtre ajouté</NewFilterAdded>
    </>
  )
}

const NewFilterAdded = styled.div<{
  hasOneFilterAdded: boolean
}>`
  position: absolute;
  display: inline-block;
  background-color: ${COLORS.grayLighter};
  top: 110px;
  right: -150px;
  opacity: 0;
  border-radius: 2px;
  width: 86px;
  height: 18px;
  padding: 11px 12px;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  z-index: 9999;

  animation: ${p => (p.hasOneFilterAdded ? 'new-filter-added' : '')} 4.5s ease;

  @keyframes new-filter-added {
    0% {
      right: -150px;
      opacity: 0;
    }
    25% {
      opacity: 0;
    }
    50% {
      right: 52px;
      opacity: 1;
    }
    75% {
      opacity: 0;
    }
    100% {
      right: -150px;
      opacity: 0;
    }
  }
`

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`

const VesselFiltersButton = styled(MapToolButton)``

const FilterIcon = styled(FilterSVG)<{
  $isRightMenuShrinked: boolean
}>`
  width: 25px;
  height: 25px;
  opacity: ${p => (p.$isRightMenuShrinked ? '0' : '1')};
  transition: all 0.2s;
  path {
    fill: ${p => p.theme.color.gainsboro};
  }
`
