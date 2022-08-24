import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import RegulatoryLayerSearchResultZone from './RegulatoryLayerSearchResultZone'

function RegulatoryLayerSearchResultZones(props) {
  const { regulatoryLayerLawType, regulatoryLayerTopic, zonesAreOpen } = props

  const { regulatoryLayersSearchResult } = useSelector(state => state.regulatoryLayerSearch)

  const getRegulatoryZones = useCallback(() => {
    if (regulatoryLayersSearchResult && regulatoryLayerLawType && regulatoryLayerTopic) {
      return regulatoryLayersSearchResult[regulatoryLayerLawType][regulatoryLayerTopic]
    }

    return []
  }, [regulatoryLayersSearchResult, regulatoryLayerLawType, regulatoryLayerTopic])

  return (
    <RegulatoryZones isOpen={zonesAreOpen} length={getRegulatoryZones().length}>
      {getRegulatoryZones().map(regulatoryZone => <RegulatoryLayerSearchResultZone
            key={regulatoryZone?.id}
            regulatoryZone={regulatoryZone}
            isOpen={zonesAreOpen}
          />)
      })}
    </RegulatoryZones>
  )
}

const RegulatoryZones = styled.div`
  height: ${props => (props.isOpen && props.length ? props.length * 36 : 0)}px;
  overflow: hidden;
  transition: 0.5s all;
`

export default RegulatoryLayerSearchResultZones
