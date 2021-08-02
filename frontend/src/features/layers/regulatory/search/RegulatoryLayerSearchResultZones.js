import React from 'react'
import styled from 'styled-components'
import RegulatoryLayerSearchResultZone from './RegulatoryLayerSearchResultZone'

const RegulatoryLayerSearchResultZones = props => {
  const {
    regulatoryLayerZones,
    toggleSelectRegulatoryLayer,
    zonesAreOpen
  } = props

  return (
    <RegulatoryZones length={regulatoryLayerZones.length} isOpen={zonesAreOpen}>
      {
        regulatoryLayerZones.map(regulatoryZone => {
          return <RegulatoryLayerSearchResultZone
            key={regulatoryZone && regulatoryZone.zone}
            regulatoryZone={regulatoryZone}
            toggleSelectRegulatoryLayer={toggleSelectRegulatoryLayer}
            isOpen={zonesAreOpen}
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
