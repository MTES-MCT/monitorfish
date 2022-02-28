import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import Checkbox from 'rsuite/lib/Checkbox'
import CheckboxGroup from 'rsuite/lib/CheckboxGroup'
import RegulatoryLayerSearchResultZones from './RegulatoryLayerSearchResultZones'
import { checkRegulatoryZones, uncheckRegulatoryZones } from './RegulatoryLayerSearch.slice'
import { COLORS } from '../../../../constants/constants'
import closeRegulatoryZoneMetadata from '../../../../domain/use_cases/closeRegulatoryZoneMetadata'

const RegulatoryLayerSearchResultTopic = ({ regulatoryLayerLawType, regulatoryLayerTopic, topicDetails }) => {
  const dispatch = useDispatch()

  const {
    regulatoryLayersSearchResult,
    regulatoryZonesChecked
  } = useSelector(state => state.regulatoryLayerSearch)

  const {
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)

  const [zonesAreOpen, setZonesAreOpen] = useState(false)

  useEffect(() => {
    if (!zonesAreOpen && regulatoryZoneMetadata?.topic === regulatoryLayerTopic) {
      dispatch(closeRegulatoryZoneMetadata())
    }
  }, [zonesAreOpen])

  const getRegulatoryZonesLength = useCallback(() => {
    if (regulatoryLayersSearchResult && regulatoryLayerLawType && regulatoryLayerTopic) {
      return regulatoryLayersSearchResult[regulatoryLayerLawType][regulatoryLayerTopic].length
    }

    return 0
  }, [regulatoryLayersSearchResult, regulatoryLayerLawType, regulatoryLayerTopic])

  const allTopicZonesAreChecked = useMemo(() => {
    if (!regulatoryZonesChecked || !regulatoryLayerTopic) {
      return false
    }

    const zonesCheckedLength = regulatoryZonesChecked
      .filter(zone => zone.topic === regulatoryLayerTopic).length
    const allZonesLength = topicDetails.length
    if (!zonesCheckedLength || !allZonesLength) {
      return false
    }

    if (zonesCheckedLength === allZonesLength) {
      return true
    }
  }, [regulatoryZonesChecked, regulatoryLayerTopic, getRegulatoryZonesLength])

  const displayNumberOfZones = () => {
    const zoneNumber = topicDetails.length
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

    const zones = regulatoryLayersSearchResult[regulatoryLayerLawType][regulatoryLayerTopic]
    if (allTopicZonesAreChecked) {
      dispatch(uncheckRegulatoryZones(zones))
    } else {
      dispatch(checkRegulatoryZones(zones))
    }
  }

  return (
    <>
      <LayerTopic
        onClick={() => setZonesAreOpen(!zonesAreOpen)}
      >
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
          value={allTopicZonesAreChecked
            ? [regulatoryLayerTopic]
            : []
          }
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

export default React.memo(RegulatoryLayerSearchResultTopic)
