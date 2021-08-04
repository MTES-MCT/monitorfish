import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as FilterSVG } from '../icons/Icone_filtres.svg'
import { COLORS } from '../../constants/constants'
import { expandRightMenu } from '../../domain/shared_slices/Global'
import Filter from './Filter'
import {
  hideFilters,
  removeFilter,
  removeTagFromFilter,
  setNonFilteredVesselsAreHidden,
  showFilter
} from '../../domain/shared_slices/Filter'
import HideNonFilteredVessels from './HideNonFilteredVessels'
import { usePrevious } from '../../hooks/usePrevious'
import unselectVessel from '../../domain/use_cases/unselectVessel'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { useClickOutsideComponent } from '../../hooks/useClickOutside'

const VesselFilters = () => {
  const dispatch = useDispatch()
  const { filters, nonFilteredVesselsAreHidden } = useSelector(state => state.filter)
  const { healthcheckTextWarning } = useSelector(state => state.global)
  const previousFilters = usePrevious(filters)
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)

  const [vesselFilterBoxIsOpen, setVesselFilterBoxIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideComponent(wrapperRef)

  useEffect(() => {
    if (clickedOutsideComponent) {
      setVesselFilterBoxIsOpen(false)
    }
  }, [clickedOutsideComponent])

  useEffect(() => {
    if (vesselFilterBoxIsOpen === true) {
      dispatch(unselectVessel())
    }
  }, [vesselFilterBoxIsOpen])

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

  const hasOneFilterAdded = useCallback(() =>
    !!(previousFilters && filters.length && filters.length > previousFilters.length), [previousFilters, filters])

  return (
    <>
      <Wrapper ref={wrapperRef}>
        <VesselFilterIcon
          healthcheckTextWarning={healthcheckTextWarning}
          rightMenuIsOpen={rightMenuIsOpen}
          isOpen={vesselFilterBoxIsOpen}
          selectedVessel={selectedVessel}
          onMouseEnter={() => dispatch(expandRightMenu())}
          title={'Mes filtres'}
          onClick={() => setVesselFilterBoxIsOpen(!vesselFilterBoxIsOpen)}>
          <FilterIcon
            rightMenuIsOpen={rightMenuIsOpen}
            selectedVessel={selectedVessel}/>
        </VesselFilterIcon>
        <VesselFilterBox
          healthcheckTextWarning={healthcheckTextWarning}
          vesselFilterBoxIsOpen={vesselFilterBoxIsOpen}>
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
          <HideNonFilteredVessels
            setNonFilteredVesselsAreHidden={setNonFilteredVesselsAreHiddenCallback}
            nonFilteredVesselsAreHidden={nonFilteredVesselsAreHidden}
          />

        </VesselFilterBox>
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

const FiltersSelectedList = styled.ul`
  margin: 0;
  background-color: ${COLORS.background};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  max-height: 550px;
  overflow-x: hidden;
  color: ${COLORS.gunMetal};
`

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
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

const VesselFilterBox = styled(MapComponentStyle)`
  width: 305px;
  background: ${COLORS.background};
  margin-right: ${props => props.vesselFilterBoxIsOpen ? '45px' : '-420px'};
  opacity: ${props => props.vesselFilterBoxIsOpen ? '1' : '0'};
  top: 110px;
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
`

const VesselFilterIcon = styled(MapButtonStyle)`
  position: absolute;
  display: inline-block;
  color: ${COLORS.blue};
  z-index: 99;
  top: 110px;
  padding: 3px 0px 0 3px;
  height: 40px;
  width: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '5px' : '40px'};
  border-radius: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '1px' : '2px'};
  right: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '10px'};
  background: ${props => props.isOpen ? COLORS.shadowBlue : COLORS.charcoal};
  transition: all 0.3s;
  
  :hover, :focus {
      background: ${props => props.isOpen ? COLORS.shadowBlue : COLORS.charcoal};
  }
`

const FilterIcon = styled(FilterSVG)`
  width: 23px;
  height: 23px;
  margin-right: 3px;
  margin-top: 2px;
  opacity: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '1'};
  transition: all 0.2s;
`

export default VesselFilters
