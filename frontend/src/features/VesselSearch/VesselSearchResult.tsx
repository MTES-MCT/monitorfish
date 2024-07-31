import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useMemo } from 'react'
import styled from 'styled-components'

import { VesselSearchResultItem } from './VesselSearchResultItem'
import { getVesselCompositeIdentifier } from '../../domain/entities/vessel/vessel'

export function VesselSearchResult({ foundVessels, searchQuery, selectVessel, showLastSearchedVessels }) {
  const lastSearchedVessels = useMainAppSelector(state => state.global.lastSearchedVessels)
  const baseUrl = useMemo(() => window.location.origin, [])

  return (
    <>
      {!!foundVessels?.length && (
        <Results>
          <List>
            {foundVessels.map(featureOrIdentity => {
              const vesselCompositeIdentifier = `${featureOrIdentity.vesselId}/${getVesselCompositeIdentifier(featureOrIdentity)}`

              return (
                <VesselSearchResultItem
                  key={vesselCompositeIdentifier}
                  baseUrl={baseUrl}
                  searchQuery={searchQuery}
                  selectVessel={selectVessel}
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
              const vesselCompositeIdentifier = `${vessel.vesselId}/${getVesselCompositeIdentifier(vessel)}`

              return (
                <VesselSearchResultItem
                  key={vesselCompositeIdentifier}
                  baseUrl={baseUrl}
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
  color: ${p => p.theme.color.gunMetal};
  border-bottom: 1px solid ${p => p.theme.color.gainsboro};
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  position: absolute;
  z-index: 9;
  width: 100%;
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
