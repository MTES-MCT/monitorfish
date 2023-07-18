import { useCallback } from 'react'
import styled from 'styled-components'

import { RegulatoryLayerSearchResultZone } from './RegulatoryLayerSearchResultZone'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'

export type RegulatoryLayerSearchResultZonesProps = {
  regulatoryLayerLawType: any
  regulatoryLayerTopic: any
  zonesAreOpen: any
}
export function RegulatoryLayerSearchResultZones({
  regulatoryLayerLawType,
  regulatoryLayerTopic,
  zonesAreOpen
}: RegulatoryLayerSearchResultZonesProps) {
  const { regulatoryLayersSearchResult } = useMainAppSelector(state => state.regulatoryLayerSearch)

  const getRegulatoryZones = useCallback(() => {
    if (regulatoryLayersSearchResult && regulatoryLayerLawType && regulatoryLayerTopic) {
      const regulatoryLayer = regulatoryLayersSearchResult[regulatoryLayerLawType]

      if (regulatoryLayer) {
        return regulatoryLayer[regulatoryLayerTopic] || []
      }
    }

    return []
  }, [regulatoryLayersSearchResult, regulatoryLayerLawType, regulatoryLayerTopic])

  return (
    <RegulatoryZones $isOpen={zonesAreOpen} $length={getRegulatoryZones().length}>
      {getRegulatoryZones().map(regulatoryZone => (
        <RegulatoryLayerSearchResultZone
          key={regulatoryZone.id}
          isOpen={zonesAreOpen}
          regulatoryZone={regulatoryZone}
        />
      ))}
    </RegulatoryZones>
  )
}

const RegulatoryZones = styled.div<{
  $isOpen: boolean
  $length: number
}>`
  height: ${p => (p.$isOpen && p.$length ? p.$length * 36 : 0)}px;
  overflow: hidden;
  transition: 0.5s all;
`
