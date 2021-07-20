import { getVesselIdentityFromFeature, getVesselIdentityFromVessel } from '../../domain/entities/vessel'
import React, { useCallback } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import focusOnVesselSearch, { focusState } from '../../domain/use_cases/focusOnVesselSearch'
import { useDispatch } from 'react-redux'
import VesselSearchItem from './VesselSearchItem'

const VesselSearchList = ({ searchText, foundVesselsOnMap, foundVesselsFromAPI, setVesselsHasBeenUpdated, setSelectedVesselIdentity, setSearchText }) => {
  const dispatch = useDispatch()

  const selectVessel = useCallback(vessel => {
    dispatch(focusOnVesselSearch(focusState.CLICK_VESSEL_SEARCH_RESULT))
    setVesselsHasBeenUpdated(false)
    setSelectedVesselIdentity(vessel)
    setSearchText('')
  }, [])

  return <>
    {
      (foundVesselsOnMap && foundVesselsOnMap.length) || (foundVesselsFromAPI && foundVesselsFromAPI.length)
        ? <Results>
          <List>
            {
              foundVesselsOnMap.map(feature => {
                const vessel = getVesselIdentityFromFeature(feature)

                return <VesselSearchItem
                  key={feature.id_}
                  id={feature.id_}
                  vessel={vessel}
                  selectVessel={() => selectVessel(vessel)}
                  searchText={searchText}
                />
              })
            }
            {
              foundVesselsFromAPI.map((vessel, index) => {
                const vesselIdentity = getVesselIdentityFromVessel(vessel)

                return <VesselSearchItem
                  key={index}
                  id={index}
                  vessel={vesselIdentity}
                  selectVessel={() => selectVessel(vesselIdentity)}
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
  color: ${COLORS.grayDarkerThree};
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
