import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { getVesselCompositeIdentifier } from '../../domain/entities/vessel/vessel'
import { useAppSelector } from '../../hooks/useAppSelector'
import { VesselSearchResultItem } from './VesselSearchResultItem'

export function VesselSearchResult({ foundVessels, searchQuery, selectVessel, showLastSearchedVessels }) {
  const { lastSearchedVessels } = useAppSelector(state => state.global)

  return (
    <>
      {!!foundVessels?.length && (
        <Results>
          <List>
            {foundVessels?.map(featureOrIdentity => {
              const vesselCompositeIdentifier =
                featureOrIdentity.vesselCompositeIdentifier || getVesselCompositeIdentifier(featureOrIdentity)

              return (
                <VesselSearchResultItem
                  key={vesselCompositeIdentifier}
                  searchQuery={searchQuery}
                  selectVessel={() => selectVessel(featureOrIdentity)}
                  vessel={featureOrIdentity}
                />
              )
            })}
          </List>
        </Results>
      )}
      {!foundVessels?.length && showLastSearchedVessels && (
        <Results>
          <List>
            {lastSearchedVessels.map(vessel => {
              const vesselCompositeIdentifier = getVesselCompositeIdentifier(vessel)

              return (
                <VesselSearchResultItem
                  key={vesselCompositeIdentifier}
                  searchQuery={searchQuery}
                  selectVessel={() => selectVessel(vessel)}
                  vessel={vessel}
                />
              )
            })}
          </List>
        </Results>
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
