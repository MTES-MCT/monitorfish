import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { getVesselId } from '../../domain/entities/vessel'
import VesselSearchResultItem from './VesselSearchResultItem'

function VesselSearchResult({
  foundVesselsFromAPI,
  foundVesselsOnMap,
  searchText,
  selectVessel,
  showLastSearchedVessels
}) {
  const { lastSearchedVessels } = useSelector(state => state.global)

  return (
    <>
      {foundVesselsOnMap?.length || foundVesselsFromAPI?.length ? (
        <Results>
          <List>
            {foundVesselsOnMap?.map(feature => <VesselSearchResultItem
                  key={feature.vesselId}
                  vessel={feature.vesselProperties}
                  selectVessel={() => selectVessel(feature.vesselProperties)}
                  searchText={searchText}
                />)
            })}
            {foundVesselsFromAPI?.map(vessel => {
              const vesselId = getVesselId(vessel)
              return (
                <VesselSearchResultItem
                  key={vesselId}
                  searchText={searchText}
                  selectVessel={() => selectVessel(vessel)}
                  vessel={vessel}
                />
              )
            })}
          </List>
        </Results>
      ) : showLastSearchedVessels ? (
        <Results>
          <List>
            {lastSearchedVessels.map(vessel => {
              const vesselId = getVesselId(vessel)
              return (
                <VesselSearchResultItem
                  key={vesselId}
                  vessel={vessel}
                  selectVessel={() => selectVessel(vessel)}
                  searchText={searchText}
                />
              )
            })}
          </List>
        </Results>
      ) : (
        ''
      )}
    </>
  )
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
