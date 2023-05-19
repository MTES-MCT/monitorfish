import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { Checkbox, CheckboxGroup } from 'rsuite'
import RegulatoryLayerSearchResultZones from './RegulatoryLayerSearchResultZones'
import { checkRegulatoryZones, uncheckRegulatoryZones } from './slice'
import { COLORS } from '../../../../../constants/constants'
import { closeRegulatoryZoneMetadata } from '../../../../../domain/use_cases/layer/regulation/closeRegulatoryZoneMetadata'
import { theme } from '../../../../../ui/theme'

const RegulatoryLayerSearchResultTopic = ({ regulatoryLayerLawType, regulatoryLayerTopic, topicDetails }) => {
  const dispatch = useDispatch()

  const { searchResultZones, searchResultZonesLength, regulatoryZonesChecked } = useSelector(state => {
    if (state.regulatoryLayerSearch.regulatoryLayersSearchResult && regulatoryLayerLawType && regulatoryLayerTopic) {
      const searchResultZones =
        state.regulatoryLayerSearch.regulatoryLayersSearchResult[regulatoryLayerLawType][regulatoryLayerTopic]

      return {
        searchResultZones: searchResultZones,
        searchResultZonesLength: searchResultZones.length,
        regulatoryZonesChecked: state.regulatoryLayerSearch.regulatoryZonesChecked
      }
    }
  })

  const { regulatoryZoneMetadata, selectedRegulatoryLayers } = useSelector(state => state.regulatory)

  const numberOfTotalZones = useSelector(state => {
    const regulatoryLayerLawTypes = state.regulatory.regulatoryLayerLawTypes
    if (regulatoryLayerLawTypes && regulatoryLayerLawType && regulatoryLayerTopic) {
      return regulatoryLayerLawTypes[regulatoryLayerLawType][regulatoryLayerTopic]?.length
    }
  })

  const allZonesAreAlreadySelected = selectedRegulatoryLayers[regulatoryLayerTopic]?.length === searchResultZonesLength

  const [zonesAreOpen, setZonesAreOpen] = useState(false)

  useEffect(() => {
    if (!zonesAreOpen && regulatoryZoneMetadata?.topic === regulatoryLayerTopic) {
      dispatch(closeRegulatoryZoneMetadata())
    }
  }, [zonesAreOpen])

  const allTopicZonesAreChecked = useMemo(() => {
    if (!regulatoryZonesChecked || !regulatoryLayerTopic) {
      return false
    }

    const zonesCheckedLength = regulatoryZonesChecked.filter(zone => zone.topic === regulatoryLayerTopic).length
    const allZonesLength = topicDetails.length
    if (!zonesCheckedLength || !allZonesLength) {
      return false
    }

    if (zonesCheckedLength === allZonesLength) {
      return true
    }
  }, [regulatoryZonesChecked, regulatoryLayerTopic])

  const handleCheckAllZones = () => {
    if (allTopicZonesAreChecked) {
      dispatch(uncheckRegulatoryZones(searchResultZones))
    } else {
      dispatch(checkRegulatoryZones(searchResultZones))
    }
  }

  return (
    <>
      <LayerTopic onClick={() => setZonesAreOpen(!zonesAreOpen)}>
        <TopicName data-cy={'regulatory-layer-topic'} title={regulatoryLayerTopic}>
          {regulatoryLayerTopic}
        </TopicName>
        <ZonesNumber>{`${topicDetails?.length}/${numberOfTotalZones}`}</ZonesNumber>
        <CheckboxGroup
          onClick={e => e.stopPropagation()}
          inline
          name="checkboxList"
          value={allTopicZonesAreChecked || allZonesAreAlreadySelected ? [regulatoryLayerTopic] : []}
          onChange={handleCheckAllZones}
          style={{ marginLeft: 0, height: 20 }}
        >
          <Checkbox
            disabled={selectedRegulatoryLayers[regulatoryLayerTopic]?.length === searchResultZonesLength}
            title={allZonesAreAlreadySelected ? 'zones déjà ajoutées à mes zones réglementaires' : ''}
            value={regulatoryLayerTopic}
          />
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
    background: ${theme.color.blueGray['25']};
  }

  .rs-checkbox-checker {
    padding-top: 24px;
  }

  .rs-checkbox {
    margin-left: 0;
  }
`

export default React.memo(RegulatoryLayerSearchResultTopic)
