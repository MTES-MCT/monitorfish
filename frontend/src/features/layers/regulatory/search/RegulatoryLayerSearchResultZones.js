import React, { useCallback } from 'react'
import styled from 'styled-components'
import RegulatoryLayerSearchResultZone from './RegulatoryLayerSearchResultZone'
import { useSelector } from 'react-redux'

const RegulatoryLayerSearchResultZones = props => {
  const {
    regulatoryLayerLawType,
    regulatoryLayerTopic,
    toggleSelectRegulatoryLayer,
    zonesAreOpen
  } = props

  const {
    regulatoryLayersSearchResult,
    regulatoryZonesChecked
  } = useSelector(state => state.regulatoryLayerSearch)

  const getRegulatoryZones = useCallback(() => {
    if (regulatoryLayersSearchResult && regulatoryLayerLawType && regulatoryLayerTopic) {
      return regulatoryLayersSearchResult[regulatoryLayerLawType][regulatoryLayerTopic]
    }

    return []
  }, [regulatoryLayersSearchResult, regulatoryLayerLawType, regulatoryLayerTopic])

  const getZoneIsChecked = useCallback(regulatoryZone => {
    if (!regulatoryZonesChecked) {
      return false
    }

    return regulatoryZonesChecked.find(zone => zone.id === regulatoryZone.id)
  }, [regulatoryZonesChecked])

  return (
    <RegulatoryZones length={getRegulatoryZones().length} isOpen={zonesAreOpen}>
      {
        getRegulatoryZones().map(regulatoryZone => {
          return <RegulatoryLayerSearchResultZone
            key={regulatoryZone?.zone}
            regulatoryZone={regulatoryZone}
            toggleSelectRegulatoryLayer={toggleSelectRegulatoryLayer}
            isOpen={zonesAreOpen}
            zoneIsChecked={getZoneIsChecked(regulatoryZone)}
          />
        })
      }
    </RegulatoryZones>
  )
}

const RegulatoryZones = styled.div`
  height: ${props => props.isOpen && props.length ? props.length * 36 : 0}px;
  overflow: hidden;
  transition: 0.5s all;
`

export default RegulatoryLayerSearchResultZones
