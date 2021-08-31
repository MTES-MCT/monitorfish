import React from 'react'
import styled from 'styled-components'
import RegulatoryLayerSearchResultLawType from './RegulatoryLayerSearchResultLawType'
import { COLORS } from '../../../../constants/constants'
import { useSelector } from 'react-redux'

const RegulatoryLayerSearchResultList = () => {
  const {
    regulatoryLayersSearchResult,
    advancedSearchIsOpen
  } = useSelector(state => state.regulatoryLayerSearch)

  return (
    <List advancedSearchIsOpen={advancedSearchIsOpen}>
      {
        regulatoryLayersSearchResult && Object.keys(regulatoryLayersSearchResult).length > 0
          ? Object.keys(regulatoryLayersSearchResult).map((lawType) => {
            return (
              <RegulatoryLayerSearchResultLawType
                key={lawType}
                regulatoryLayerLawType={lawType}
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
  max-height: ${props => props.advancedSearchIsOpen ? '55vh' : '74vh'};
  overflow-y: auto;
  overflow-x: hidden;
  color: ${COLORS.slateGray};
  transition: 0.5s all;
`

export default RegulatoryLayerSearchResultList
