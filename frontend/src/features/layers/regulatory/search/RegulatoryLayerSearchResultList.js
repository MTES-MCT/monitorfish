import React from 'react'
import styled from 'styled-components'
import RegulatoryLayerSearchResultLawType from './RegulatoryLayerSearchResultLawType'
import { COLORS } from '../../../../constants/constants'

const RegulatoryLayerSearchResultList = props => {
  const {
    toggleSelectRegulatoryLayer,
    foundRegulatoryLayers
  } = props

  return (
    <List>
      {
        foundRegulatoryLayers && Object.keys(foundRegulatoryLayers).length > 0
          ? Object.keys(foundRegulatoryLayers).map((lawType) => {
            return (
              <RegulatoryLayerSearchResultLawType
                key={lawType}
                regulatoryLayerTopics={Object.keys(foundRegulatoryLayers[lawType])}
                regulatoryLayerLawType={lawType}
                toggleSelectRegulatoryLayer={toggleSelectRegulatoryLayer}
                foundRegulatoryLayers={foundRegulatoryLayers}
              />
            )
          })
          : null
      }
    </List>
  )
}

const List = styled.ul`
  margin: 0;
  background: ${COLORS.background};
  border-radius: 0;
  padding: 0;
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
  color: ${COLORS.slateGray};
`

export default RegulatoryLayerSearchResultList
