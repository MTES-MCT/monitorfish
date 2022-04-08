import React, { useCallback } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import focusOnVesselSearch, { focusState } from '../../domain/use_cases/vessel/focusOnVesselSearch'
import { useDispatch, useSelector } from 'react-redux'
import VesselSearchItem from './VesselSearchItem'
import { getVesselId } from '../../domain/entities/vessel'

const VesselSearchList = ({
  searchText,
  foundVesselsOnMap,
  foundVesselsFromAPI,
  setVesselsHasBeenUpdated,
  setSelectedVesselIdentity,
  setSearchText,
  showLastSearchedVessels
}) => {
  const dispatch = useDispatch()
  const {
    lastSearchedVessels
  } = useSelector(state => state.global)

  const selectVessel = useCallback(vessel => {
    dispatch(focusOnVesselSearch(focusState.CLICK_VESSEL_SEARCH_RESULT))
    setVesselsHasBeenUpdated(false)
    setSelectedVesselIdentity(vessel)
    setSearchText('')
  }, [])

  return <>
    {
      (foundVesselsOnMap?.length) || (foundVesselsFromAPI?.length)
        ? <Results>
          <List>
            {
              foundVesselsOnMap?.map(feature => {
                return <VesselSearchItem
                  key={feature.vesselId}
                  vessel={feature.vesselProperties}
                  selectVessel={() => selectVessel(feature.vesselProperties)}
                  searchText={searchText}
                />
              })
            }
            {
              foundVesselsFromAPI?.map((vessel) => {
                const vesselId = getVesselId(vessel)
                return <VesselSearchItem
                  key={vesselId}
                  vessel={vessel}
                  selectVessel={() => selectVessel(vessel)}
                  searchText={searchText}
                />
              })
            }
          </List>
        </Results>
        : showLastSearchedVessels
          ? <Results>
            <List>
              {
                lastSearchedVessels.map(vessel => {
                  const vesselId = getVesselId(vessel)
                  return <VesselSearchItem
                    key={vesselId}
                    id={vesselId}
                    vessel={vessel}
                    selectVessel={() => selectVessel(vessel)}
                    searchText={searchText}
                  />
                })
              }
            </List>
          </Results>
          : ''
    }
  </>
}

export default VesselSearchList

const Results = styled.div`
  background: white;
  color: ${COLORS.gunMetal};
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`

const List = styled.ul`
  margin: 0;
  padding: 0;
  border-radius: 2px;
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 311px;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`
