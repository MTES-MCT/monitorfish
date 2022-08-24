import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import RegulatoryLayerSearchResultLawType from './RegulatoryLayerSearchResultLawType'

function RegulatoryLayerSearchResultList() {
  const { advancedSearchIsOpen, regulatoryLayersSearchResult } = useSelector(state => state.regulatoryLayerSearch)

  return (
    <List $advancedSearchIsOpen={advancedSearchIsOpen}>
      {regulatoryLayersSearchResult && Object.keys(regulatoryLayersSearchResult).length > 0
        ? Object.entries(regulatoryLayersSearchResult)?.map(([lawType, topic]) => (
            <RegulatoryLayerSearchResultLawType key={lawType} regulatoryLayerLawType={lawType} topic={topic} />
          ))
        : null}
    </List>
  )
}

const List = styled.ul`
  margin: 0;
  background: ${COLORS.background};
  border-radius: 0;
  padding: 0;
  max-height: ${props => (props.$advancedSearchIsOpen ? '55vh' : '74vh')};
  overflow-y: auto;
  overflow-x: hidden;
  color: ${COLORS.slateGray};
  transition: 0.5s all;
`

export default RegulatoryLayerSearchResultList
