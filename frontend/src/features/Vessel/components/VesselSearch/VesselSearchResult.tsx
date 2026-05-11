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
  foundVessels: Vessel.VesselIdentity[]
  onAISChange?: ((vessel: AISVessel.AISVessel) => void) | undefined
  onSelect: (vessel: Vessel.VesselIdentity) => void
  searchQuery: string | undefined
  withLastSearchResults: boolean
}>

function aisVesselToVesselIdentity(v: AISVessel.AISVessel): Vessel.VesselIdentity {
  return {
    beaconNumber: undefined,
    districtCode: undefined,
    externalReferenceNumber: undefined,
    flagState: v.flagState,
    internalReferenceNumber: undefined,
    ircs: v.ircs,
    mmsi: String(v.mmsi),
    vesselId: undefined,
    vesselIdentifier: undefined,
    vesselLength: undefined,
    vesselName: v.vesselName
  }
}

export function VesselSearchResult({
  foundAISVessels,
  foundVessels,
  onAISChange,
  onSelect,
  searchQuery,
  withLastSearchResults
}: VesselSearchResultProps) {
  const baseUrl = useMemo(() => window.location.origin, [])

  const lastSearchResults = localStorageManager
    .get<Vessel.VesselIdentity[]>(LocalStorageKey.LastSearchVessels, [])
    .map(getVesselIdentityFromLegacyVesselIdentity)

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
      {withLastSearchResults && !foundVessels.length && lastSearchResults.length > 0 && (
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
      {!!foundAISVessels?.length && (
        <Results>
          <List>
            {foundAISVessels.map(aisVessel => (
              <VesselSearchResultItem
                key={aisVessel.vesselFeatureId}
                baseUrl={baseUrl}
                // eslint-disable-next-line react/jsx-no-bind
                onClick={_ => onAISChange?.(aisVessel)}
                searchQuery={searchQuery}
                vessel={aisVesselToVesselIdentity(aisVessel)}
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
