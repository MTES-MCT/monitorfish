import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useMemo } from 'react'
import styled from 'styled-components'

import { VesselSearchResultItem } from './VesselSearchResultItem'

export function VesselSearchResult({ foundVessels, searchQuery, selectVessel, showLastSearchedVessels }) {
  const lastSearchedVessels = useMainAppSelector(state => state.global.lastSearchedVessels)
  const baseUrl = useMemo(() => window.location.origin, [])

  return (
    <>
      {!!foundVessels?.length && (
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
      )}
      {!foundVessels?.length && showLastSearchedVessels && (
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
      )}
    </>
  )
}

const List = styled.ul`
  margin: 0;
  padding: 0;
  border-radius: 2px;
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 311px;
  background: white;
  color: ${p => p.theme.color.gunMetal};
  border-bottom: 1px solid ${p => p.theme.color.gainsboro};
  position: absolute;
  width: 100%;
  z-index: 1;
`
