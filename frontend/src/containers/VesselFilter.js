import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as FilterSVG } from '../components/icons/Icone_filtres.svg'
import { COLORS } from '../constants/constants'
import { expandRightMenu } from '../domain/reducers/Global'
import Filter from '../components/vessel_filters/Filter'
import { hideFilters, removeFilter, removeTagFromFilter, showFilter } from '../domain/reducers/Filter'

const VesselFilter = () => {
  const dispatch = useDispatch()
  const filters = useSelector(state => state.filter.filters)
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const temporaryVesselsToHighLightOnMap = useSelector(state => state.vessel.temporaryVesselsToHighLightOnMap)
  const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)

  const [vesselFilterBoxIsOpen, setVesselFilterBoxIsOpen] = useState(false)
  const [isShowed, setIsShowed] = useState(true)

  const wrapperRef = useRef(null)

  useEffect(() => {
    setIsShowed(!(temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length))
  }, [temporaryVesselsToHighLightOnMap])

  useEffect(() => {
    function handleClickOutside (event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setVesselFilterBoxIsOpen(false)
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [wrapperRef])

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

  return (
    <Wrapper isShowed={isShowed} ref={wrapperRef}>
      <VesselFilterIcon
        rightMenuIsOpen={rightMenuIsOpen}
        selectedVessel={selectedVessel}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title={'Mes filtres'}
        onClick={() => setVesselFilterBoxIsOpen(!vesselFilterBoxIsOpen)}>
        <FilterIcon
          rightMenuIsOpen={rightMenuIsOpen}
          selectedVessel={selectedVessel}/>
      </VesselFilterIcon>
      <VesselFilterBox
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

      </VesselFilterBox>
    </Wrapper>
  )
}

const FiltersSelectedList = styled.ul`
  margin: 0;
  background-color: ${COLORS.background};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  max-height: 550px;
  overflow-x: hidden;
  color: ${COLORS.grayDarkerThree};
`

const Wrapper = styled.div`
  opacity: ${props => props.isShowed ? '1' : '0'};
  transition: all 0.2s;
  z-index: 1000;
`

const LastPositionInfo = styled.div`
  font-size: 13px;
  margin: 15px;
  color: ${COLORS.grayDarkerThree};
`

const Header = styled.div`
  background: ${COLORS.textGray};
  color: ${COLORS.grayBackground};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
  border-top-left-radius: ${props => props.isFirst ? '2px' : '0'};
  border-top-right-radius: ${props => props.isFirst ? '2px' : '0'};
`

const VesselFilterBox = styled.div`
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

const VesselFilterIcon = styled.button`
  position: absolute;
  display: inline-block;
  color: #05055E;
  background: ${COLORS.grayDarkerThree};
  z-index: 99;
  top: 102px;
  padding: 3px 0px 0 3px;
  margin-top: 8px;
  height: 40px;
  width: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '5px' : '40px'};
  border-radius: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '1px' : '2px'};
  right: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '10px'};
  transition: all 0.3s;
  
  :hover, :focus {
      background: ${COLORS.grayDarkerThree};
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

export default VesselFilter
