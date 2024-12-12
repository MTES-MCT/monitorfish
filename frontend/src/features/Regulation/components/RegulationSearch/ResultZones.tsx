import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useCallback } from 'react'
import styled from 'styled-components'

import { ResultZone } from './ResultZone'

export type RegulatoryLayerSearchResultZonesProps = {
  areZonesOpened: any
  regulatoryLayerLawType: any
  regulatoryLayerTopic: any
}
export function ResultZones({
  areZonesOpened,
  regulatoryLayerLawType,
  regulatoryLayerTopic
}: RegulatoryLayerSearchResultZonesProps) {
  const regulatoryLayersSearchResult = useMainAppSelector(
    state => state.regulatoryLayerSearch.regulatoryLayersSearchResult
  )

  const getRegulatoryZones = useCallback(() => {
    if (regulatoryLayersSearchResult && regulatoryLayerLawType && regulatoryLayerTopic) {
      const regulatoryLayer = regulatoryLayersSearchResult[regulatoryLayerLawType]

      if (regulatoryLayer) {
        return regulatoryLayer[regulatoryLayerTopic] ?? []
      }
    }

    return []
  }, [regulatoryLayersSearchResult, regulatoryLayerLawType, regulatoryLayerTopic])

  return (
    <RegulatoryZones $isOpen={areZonesOpened} $length={getRegulatoryZones().length}>
      {getRegulatoryZones().map(regulatoryZone => (
        <ResultZone key={regulatoryZone.id} isOpen={areZonesOpened} regulatoryZone={regulatoryZone} />
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
  border-bottom: ${p => (p.$isOpen ? `1px solid ${p.theme.color.lightGray}` : 'unset')};
`
