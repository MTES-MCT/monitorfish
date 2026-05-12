import { aisVesselToVesselIdentity } from '@features/Vessel/components/VesselSearch/utils'
import { getVesselCompositeIdentifier, getVesselIdentityFromLegacyVesselIdentity } from '@features/Vessel/utils'
import { localStorageManager } from '@libs/LocalStorageManager'
import { LocalStorageKey } from '@libs/LocalStorageManager/constants'
import { useMemo } from 'react'
import styled from 'styled-components'

import { VesselSearchResultItem } from './VesselSearchResultItem'

import type { AISVessel } from '../../AISVessel.types'
import type { Vessel } from '../../Vessel.types'

type VesselSearchResultProps = Readonly<{
  foundAISVessels?: AISVessel.AISVessel[] | undefined
  foundVMSOrReferentialVessels: Vessel.VesselIdentity[]
  onAISVesselSelect?: ((vessel: AISVessel.AISVessel) => void) | undefined
  onVMSOrReferentialVesselSelect: (vessel: Vessel.VesselIdentity) => void
  searchQuery: string | undefined
  withLastSearchResults: boolean
}>
export function VesselSearchResult({
  foundAISVessels,
  foundVMSOrReferentialVessels,
  onAISVesselSelect,
  onVMSOrReferentialVesselSelect,
  searchQuery,
  withLastSearchResults
}: VesselSearchResultProps) {
  const baseUrl = useMemo(() => window.location.origin, [])

  const lastSearchResults = localStorageManager
    .get<Vessel.VesselIdentity[]>(LocalStorageKey.LastSearchVessels, [])
    .map(getVesselIdentityFromLegacyVesselIdentity)

  const hasFoundVessels = foundVMSOrReferentialVessels.length > 0 || !!foundAISVessels?.length

  return (
    <>
      {hasFoundVessels && (
        <Results>
          <List>
            {foundVMSOrReferentialVessels.map(featureOrIdentity => (
              <VesselSearchResultItem
                key={`${featureOrIdentity.vesselId}-${getVesselCompositeIdentifier(featureOrIdentity)}`}
                baseUrl={baseUrl}
                onClick={onVMSOrReferentialVesselSelect}
                searchQuery={searchQuery}
                vessel={featureOrIdentity}
              />
            ))}
            {foundAISVessels?.map(aisVessel => (
              <VesselSearchResultItem
                key={aisVessel.vesselFeatureId}
                baseUrl={baseUrl}
                // eslint-disable-next-line react/jsx-no-bind
                onClick={_ => onAISVesselSelect?.(aisVessel)}
                searchQuery={searchQuery}
                vessel={aisVesselToVesselIdentity(aisVessel)}
              />
            ))}
          </List>
        </Results>
      )}
      {withLastSearchResults && !hasFoundVessels && lastSearchResults.length > 0 && (
        <Results>
          <List>
            {lastSearchResults.map(vessel => (
              <VesselSearchResultItem
                key={`${vessel.vesselId}-${getVesselCompositeIdentifier(vessel)}`}
                baseUrl={baseUrl}
                onClick={onVMSOrReferentialVesselSelect}
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
  box-shadow: 0 1px 1px ${p => p.theme.color.slateGray};
  color: ${p => p.theme.color.gunMetal};
  border-bottom: 1px solid ${p => p.theme.color.gainsboro};
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  position: absolute;
  width: 100%;
  z-index: 1;
`

const List = styled.ul`
  margin: 0;
  padding: 0;
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 311px;
  border-radius: 2px;
`
