import { localStorageManager } from '@libs/LocalStorageManager'
import { LocalStorageKey } from '@libs/LocalStorageManager/constants'
import { useMemo } from 'react'
import styled from 'styled-components'

import { VesselSearchResultItem } from './VesselSearchResultItem'
import { getVesselCompositeIdentifier } from '../../../../domain/entities/vessel/vessel'

import type { VesselIdentity } from 'domain/entities/vessel/types'

type VesselSearchResultProps = Readonly<{
  foundVessels: VesselIdentity[]
  onSelect: (vessel: VesselIdentity) => void
  searchQuery: string | undefined
  withLastSearchResults: boolean
}>
export function VesselSearchResult({
  foundVessels,
  onSelect,
  searchQuery,
  withLastSearchResults
}: VesselSearchResultProps) {
  const baseUrl = useMemo(() => window.location.origin, [])

  const lastSearchResults = localStorageManager.get<VesselIdentity[]>(LocalStorageKey.LastSearchVessels, [])

  return (
    <>
      {foundVessels.length > 0 && (
        <Results>
          <List>
            {foundVessels.map(featureOrIdentity => (
              <VesselSearchResultItem
                key={`${featureOrIdentity.vesselId}-${getVesselCompositeIdentifier(featureOrIdentity)}`}
                baseUrl={baseUrl}
                onClick={onSelect}
                searchQuery={searchQuery}
                vessel={featureOrIdentity}
              />
            ))}
          </List>
        </Results>
      )}
      {withLastSearchResults && !foundVessels.length && lastSearchResults?.length && (
        <Results>
          <List>
            {lastSearchResults.map(vessel => (
              <VesselSearchResultItem
                key={`${vessel.vesselId}-${getVesselCompositeIdentifier(vessel)}`}
                baseUrl={baseUrl}
                onClick={onSelect}
                searchQuery={searchQuery}
                vessel={vessel}
              />
            ))}
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
