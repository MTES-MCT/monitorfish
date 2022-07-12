import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { useSelector } from 'react-redux'
import VesselSearchResultItem from './VesselSearchResultItem'
import { getVesselId } from '../../domain/entities/vessel'

const VesselSearchResult = ({
  searchText,
  foundVesselsOnMap,
  foundVesselsFromAPI,
  selectVessel,
  showLastSearchedVessels
}) => {
  const {
    lastSearchedVessels
  } = useSelector(state => state.global)

  return <>
    {
      (foundVesselsOnMap?.length) || (foundVesselsFromAPI?.length)
        ? <Results>
          <List>
            {
              foundVesselsOnMap?.map(feature => {
                return <VesselSearchResultItem
                  key={feature.vesselId}
                  vessel={feature.vesselProperties}
                  selectVessel={() => selectVessel(feature.vesselProperties)}
                  searchText={searchText}
                />
              })
            }
            {
              foundVesselsFromAPI?.map(vessel => {
                const vesselId = getVesselId(vessel)
                return <VesselSearchResultItem
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
          ? <Results isOpen={lastSearchedVessels?.length}>
            <List>
              {
                lastSearchedVessels.map(vessel => {
                  const vesselId = getVesselId(vessel)
                  return <VesselSearchResultItem
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

export default VesselSearchResult
