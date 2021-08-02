import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import RegulatoryLayerSearchResultTopic from './RegulatoryLayerSearchResultTopic'

const RegulatoryLayerSearchResultLawType = props => {
  const {
    regulatoryLayerLawType,
    regulatoryLayerTopics,
    toggleSelectRegulatoryLayer,
    foundRegulatoryLayers
  } = props

  return (
    <Wrapper>
      <LayerLawType>
        {regulatoryLayerLawType}
      </LayerLawType>
        {
          regulatoryLayerTopics.map(regulatoryLayerTopic => {
            return <RegulatoryLayerSearchResultTopic
              key={regulatoryLayerTopic}
              toggleSelectRegulatoryLayer={toggleSelectRegulatoryLayer}
              regulatoryLayerLawType={regulatoryLayerLawType}
              regulatoryLayerTopic={regulatoryLayerTopic}
              regulatoryLayerZones={foundRegulatoryLayers[regulatoryLayerLawType][regulatoryLayerTopic]}
            />
          })
    }
    </Wrapper>
  )
}

const Wrapper = styled.li`
  padding: 0px 5px 0px 0px;
  margin: 0;
  font-size: 0.8em;
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
