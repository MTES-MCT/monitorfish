import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import Checkbox from 'rsuite/lib/Checkbox'
import CheckboxGroup from 'rsuite/lib/CheckboxGroup'
import RegulatoryLayerSearchResultZones from './RegulatoryLayerSearchResultZones'
import { useDispatch, useSelector } from 'react-redux'
import { checkRegulatoryZones, uncheckRegulatoryZones } from './RegulatoryLayerSearch.slice'

const RegulatoryLayerSearchResultTopic = props => {
  const {
    regulatoryLayerLawType,
    regulatoryLayerTopic
  } = props
  const dispatch = useDispatch()

  const {
    regulatoryLayersSearchResult,
    regulatoryZonesChecked
  } = useSelector(state => state.regulatoryLayerSearch)

  const [topicSelection, setTopicSelection] = useState([])
  const [zonesAreOpen, setZonesAreOpen] = useState(false)

  const getRegulatoryZonesLength = useCallback(() => {
    if (regulatoryLayersSearchResult && regulatoryLayerLawType && regulatoryLayerTopic) {
      return regulatoryLayersSearchResult[regulatoryLayerLawType][regulatoryLayerTopic].length
    }

    return 0
  }, [regulatoryLayersSearchResult, regulatoryLayerLawType, regulatoryLayerTopic])

  const allTopicZonesAreChecked = useCallback(() => {
    if (!regulatoryZonesChecked || !regulatoryLayerTopic) {
      return false
    }

    const zonesCheckedLength = regulatoryZonesChecked
      .filter(zone => zone.topic === regulatoryLayerTopic).length
    const allZonesLength = getRegulatoryZonesLength()
    if (!zonesCheckedLength || !allZonesLength) {
      return false
    }

    if (zonesCheckedLength === allZonesLength) {
      return true
    }
  }, [regulatoryZonesChecked, getRegulatoryZonesLength])

  useEffect(() => {
    if (allTopicZonesAreChecked()) {
      if (topicSelection && !topicSelection.length) {
        setTopicSelection([regulatoryLayerTopic])
      }
    } else {
      if (topicSelection && topicSelection.length) {
        setTopicSelection([])
      }
    }
  }, [regulatoryZonesChecked, regulatoryLayersSearchResult])

  const displayNumberOfZones = () => {
    const zoneNumber = getRegulatoryZonesLength()
    return (
      <ZonesNumber>
        {`${zoneNumber} zone${zoneNumber > 1 ? 's' : ''}`}
      </ZonesNumber>
    )
  }

  const handleCheckAllZones = () => {
    if (!regulatoryLayersSearchResult || !regulatoryLayerLawType || !regulatoryLayerTopic) {
      return
    }

    if (topicSelection?.length) {
      dispatch(uncheckRegulatoryZones(regulatoryLayersSearchResult[regulatoryLayerLawType][regulatoryLayerTopic]))
      setTopicSelection([])
    } else {
      dispatch(checkRegulatoryZones(regulatoryLayersSearchResult[regulatoryLayerLawType][regulatoryLayerTopic]))
      setTopicSelection([regulatoryLayerTopic])
    }
  }

  return (
    <>
      <LayerTopic onClick={() => setZonesAreOpen(!zonesAreOpen)}>
        <TopicName
          data-cy={'regulatory-layer-topic'}
          title={regulatoryLayerTopic.replace(/[_]/g, ' ')}
        >
          {regulatoryLayerTopic.replace(/[_]/g, ' ')}
        </TopicName>
        {displayNumberOfZones()}
        <CheckboxGroup
          onClick={e => e.stopPropagation()}
          inline
          name="checkboxList"
          value={topicSelection}
          onChange={handleCheckAllZones}
          style={{ marginLeft: 0, height: 20 }}
        >
          <Checkbox value={regulatoryLayerTopic}/>
        </CheckboxGroup>
      </LayerTopic>
      <RegulatoryLayerSearchResultZones
        regulatoryLayerLawType={regulatoryLayerLawType}
        regulatoryLayerTopic={regulatoryLayerTopic}
        zonesAreOpen={zonesAreOpen}
      />
    </>
  )
}

const ZonesNumber = styled.span`
  font-size: 13px;
  color: ${COLORS.slateGray};
  margin-left: auto;
  line-height: 34px;
  font-weight: 400;
`

const TopicName = styled.span`
  user-select: none;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: ${COLORS.gunMetal};
  max-width: 300px;
  line-height: 33px;
`

const LayerTopic = styled.div`
  display: flex;
  user-select: none;
  text-overflow: ellipsis;
  overflow: hidden !important;
  padding-right: 0;
  height: 35px;
  font-size: 13px;
  padding-left: 18px;
  font-weight: 700;
  color: ${COLORS.gunMetal};
  border-bottom: 1px solid ${COLORS.lightGray};
 
  :hover {
    background: ${COLORS.shadowBlueLittleOpacity};
  }
  
  .rs-checkbox-checker {
    padding-top: 24px;
  }
  
  .rs-checkbox {
    margin-left: 0;
  }
`

export default RegulatoryLayerSearchResultTopic
