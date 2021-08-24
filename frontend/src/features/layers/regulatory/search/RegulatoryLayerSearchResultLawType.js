import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import RegulatoryLayerSearchResultTopic from './RegulatoryLayerSearchResultTopic'
import { useSelector } from 'react-redux'

const RegulatoryLayerSearchResultLawType = props => {
  const {
    regulatoryLayerLawType
  } = props

  const {
    regulatoryLayersSearchResult
  } = useSelector(state => state.regulatoryLayerSearch)

  return (
    <Wrapper>
      <LayerLawType>
        {regulatoryLayerLawType}
      </LayerLawType>
        {
          Object.keys(regulatoryLayersSearchResult[regulatoryLayerLawType]).map(regulatoryLayerTopic => {
            return <RegulatoryLayerSearchResultTopic
              key={regulatoryLayerTopic}
              regulatoryLayerLawType={regulatoryLayerLawType}
              regulatoryLayerTopic={regulatoryLayerTopic}
            />
          })
    }
    </Wrapper>
  )
}

const Wrapper = styled.li`
  padding: 0px 5px 0px 0px;
  margin: 0;
  font-size: 13px;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  cursor: pointer;
  margin: 0;
  line-height: 1.9em;
`

const LayerLawType = styled.span`
  user-select: none;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  padding-right: 10px;
  line-height: 2.7em;
  font-size: 16px;
  font-weight: 700;
  padding-left: 18px;
  color: ${COLORS.gunMetal};
`

export default RegulatoryLayerSearchResultLawType
