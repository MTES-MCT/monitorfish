import { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as FilterSVG } from '../../../icons/Icone_filtres.svg'
import { COLORS } from '../../../../constants/constants'
import { expandRightMenu, setMapToolOpened } from '../../../../domain/shared_slices/Global'
import { usePrevious } from '../../../../hooks/usePrevious'
import { MapButtonStyle } from '../../../commonStyles/MapButton.style'
import { useClickOutsideWhenOpened } from '../../../../hooks/useClickOutsideWhenOpened'
import Filters from './Filters'
import { MapTool } from '../../../../domain/entities/map'
import { MapToolButton } from '../MapToolButton'

const VesselFiltersMapButton = () => {
  const dispatch = useDispatch()
  const { filters } = useSelector(state => state.filter)
  const {
    healthcheckTextWarning,
    previewFilteredVesselsMode,
    mapToolOpened
  } = useSelector(state => state.global)
  const previousFilters = usePrevious(filters)
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)

  const isOpen = useMemo(() => mapToolOpened === MapTool.FILTERS, [mapToolOpened])
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, isOpen)

  useEffect(() => {
    if (clickedOutsideComponent) {
      dispatch(setMapToolOpened(undefined))
    }
  }, [clickedOutsideComponent])

  function openOrCloseVesselFilters() {
    if (isOpen) {
      dispatch(setMapToolOpened(undefined))
    } else {
      dispatch(setMapToolOpened(MapTool.FILTERS))
    }
  }

  const hasOneFilterAdded = useCallback(() =>
    !!(previousFilters && filters.length && filters.length > previousFilters.length), [previousFilters, filters])

  return (
    <>
      <Wrapper ref={wrapperRef}>
        <VesselFiltersButton
          data-cy={'vessel-filters'}
          isHidden={previewFilteredVesselsMode}
          healthcheckTextWarning={healthcheckTextWarning}
          rightMenuIsOpen={rightMenuIsOpen}
          isOpen={isOpen}
          selectedVessel={selectedVessel}
          onMouseEnter={() => dispatch(expandRightMenu())}
          title={'Mes filtres'}
          onClick={openOrCloseVesselFilters}>
          <FilterIcon
            $rightMenuIsOpen={rightMenuIsOpen}
            $selectedVessel={selectedVessel}/>
        </VesselFiltersButton>
        <Filters/>
      </Wrapper>
      <NewFilterAdded hasOneFilterAdded={hasOneFilterAdded()}>
        1 filtre ajouté
      </NewFilterAdded>
    </>
  )
}

const NewFilterAdded = styled.div`
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

  animation: ${props => props.hasOneFilterAdded ? 'new-filter-added' : ''} 4.5s ease;

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

const VesselFiltersButton = styled(MapToolButton)`
  top: 110px;
`

const FilterIcon = styled(FilterSVG)`
  width: 23px;
  height: 23px;
  margin-right: 3px;
  margin-top: 2px;
  opacity: ${props => props.$selectedVessel && !props.$rightMenuIsOpen ? '0' : '1'};
  transition: all 0.2s;
`

export default VesselFiltersMapButton
