import { usePrevious } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'

import Filters from './Filters'
import { COLORS } from '../../../constants/constants'
import { MapToolType } from '../../../domain/entities/map/constants'
import { setMapToolOpened } from '../../../domain/shared_slices/Global'
import { useClickOutsideWhenOpenedAndExecute } from '../../../hooks/useClickOutsideWhenOpenedAndExecute'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import FilterSVG from '../../icons/standardized/Filter.svg?react'
import { MapToolButton } from '../shared/MapToolButton'

export function VesselFiltersMapButton() {
  const dispatch = useMainAppDispatch()
  const { filters } = useMainAppSelector(state => state.filter)
  const { mapToolOpened } = useMainAppSelector(state => state.global)
  const previousFilters = usePrevious(filters)
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)

  const isRightMenuShrinked = !rightMenuIsOpen
  const isOpen = useMemo(() => mapToolOpened === MapToolType.FILTERS, [mapToolOpened])
  const wrapperRef = useRef(null)

  useClickOutsideWhenOpenedAndExecute(wrapperRef, isOpen, () => {
    dispatch(setMapToolOpened(undefined))
  })

  const openOrCloseVesselFilters = useCallback(() => {
    if (isOpen) {
      dispatch(setMapToolOpened(undefined))
    } else {
      dispatch(setMapToolOpened(MapToolType.FILTERS))
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
          data-cy="vessel-filters"
          isActive={isOpen}
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
  animation: ${p => (p.hasOneFilterAdded ? 'new-filter-added' : '')} 4.5s ease;
  background-color: ${p => p.theme.color.gainsboro};
  border-radius: 2px;
  color: ${COLORS.gunMetal};
  display: inline-block;
  font-size: 13px;
  height: 18px;
  opacity: 0;
  padding: 11px 12px;
  position: absolute;
  right: -150px;
  top: 110px;
  width: 86px;
  z-index: 9999;

  @keyframes new-filter-added {
    0% {
      opacity: 0;
      right: -150px;
    }

    25% {
      opacity: 0;
    }

    50% {
      opacity: 1;
      right: 52px;
    }

    75% {
      opacity: 0;
    }

    100% {
      opacity: 0;
      right: -150px;
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
  height: 25px;
  opacity: ${p => (p.$isRightMenuShrinked ? '0' : '1')};
  transition: all 0.2s;
  width: 25px;

  path {
    fill: ${p => p.theme.color.gainsboro};
  }
`
