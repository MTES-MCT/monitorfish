import { MapBox } from '@features/Map/constants'
import { useClickOutsideWhenOpenedAndExecute } from '@hooks/useClickOutsideWhenOpenedAndExecute'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, usePrevious } from '@mtes-mct/monitor-ui'
import { useRef } from 'react'
import styled from 'styled-components'

import { Filters } from './Filters'
import { setRightMapBoxOpened } from '../../../../domain/shared_slices/Global'
import { MapToolButton } from '../../../MainWindow/components/MapButtons/shared/MapToolButton'

export function VesselFiltersMapButton() {
  const dispatch = useMainAppDispatch()
  const filters = useMainAppSelector(state => state.filter.filters)
  const previousFilters = usePrevious(filters)
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)

  const isOpen = rightMapBoxOpened === MapBox.FILTERS
  const wrapperRef = useRef(null)

  useClickOutsideWhenOpenedAndExecute(wrapperRef, isOpen, () => {
    dispatch(setRightMapBoxOpened(undefined))
  })

  const openOrCloseVesselFilters = () => {
    if (isOpen) {
      dispatch(setRightMapBoxOpened(undefined))

      return
    }

    dispatch(setRightMapBoxOpened(MapBox.FILTERS))
  }

  const hasOneFilterAdded = !!(previousFilters && filters.length && filters.length > previousFilters.length)

  return (
    <>
      <Wrapper ref={wrapperRef}>
        <MapToolButton
          data-cy="vessel-filters"
          Icon={Icon.Filter}
          isActive={isOpen}
          onClick={openOrCloseVesselFilters}
          style={{ top: 124 }}
          title="Mes filtres"
        />
        <Filters />
      </Wrapper>
      <NewFilterAdded $hasOneFilterAdded={hasOneFilterAdded}>1 filtre ajouté</NewFilterAdded>
    </>
  )
}

const NewFilterAdded = styled.div<{
  $hasOneFilterAdded: boolean
}>`
  animation: ${p => (p.$hasOneFilterAdded ? 'new-filter-added' : '')} 4.5s ease;
  background-color: ${p => p.theme.color.gainsboro};
  border-radius: 2px;
  color: ${p => p.theme.color.gunMetal};
  display: inline-block;
  font-size: 13px;
  height: 18px;
  opacity: 0;
  padding: 11px 12px;
  position: absolute;
  right: -150px;
  top: 122px;
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
