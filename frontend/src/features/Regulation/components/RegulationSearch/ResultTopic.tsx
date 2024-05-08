import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Checkbox, logSoftError, THEME } from '@mtes-mct/monitor-ui'
import { memo, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ResultZones } from './ResultZones'
import { checkRegulatoryZones, uncheckRegulatoryZones } from './slice'

import type { RegulatoryZone } from '../../types'

export type RegulatoryLayerSearchResultTopicProps = {
  regulatoryLayerLawType?: string
  regulatoryLayerTopic?: string
  topicDetails: RegulatoryZone[]
}
function UnmemoizedRegulatoryLayerSearchResultTopic({
  regulatoryLayerLawType,
  regulatoryLayerTopic,
  topicDetails
}: RegulatoryLayerSearchResultTopicProps) {
  const dispatch = useMainAppDispatch()

  const regulatoryLayerLawTypes = useMainAppSelector(state => state.regulatory.regulatoryLayerLawTypes)
  const selectedRegulatoryLayers = useMainAppSelector(state => state.regulatory.selectedRegulatoryLayers)
  const regulatoryLayersSearchResult = useMainAppSelector(
    state => state.regulatoryLayerSearch.regulatoryLayersSearchResult
  )
  const regulatoryZonesChecked = useMainAppSelector(state => state.regulatoryLayerSearch.regulatoryZonesChecked)

  const { searchResultZones, searchResultZonesLength } = useMemo<{
    searchResultZones: any[]
    searchResultZonesLength: number
  }>(() => {
    const defaultValue = {
      searchResultZones: [],
      searchResultZonesLength: 0
    }

    if (!regulatoryLayersSearchResult || !regulatoryLayerLawType || !regulatoryLayerTopic) {
      return defaultValue
    }
    const regulatoryLayer = regulatoryLayersSearchResult[regulatoryLayerLawType]
    if (!regulatoryLayer) {
      return defaultValue
    }

    // eslint-disable-next-line no-underscore-dangle
    const _searchResultZones = regulatoryLayer[regulatoryLayerTopic]
    if (!_searchResultZones) {
      logSoftError({
        message: '`_searchResultZones` is undefined.'
      })

      return defaultValue
    }

    return {
      searchResultZones: _searchResultZones,
      searchResultZonesLength: _searchResultZones.length
    }
  }, [regulatoryLayersSearchResult, regulatoryLayerLawType, regulatoryLayerTopic])

  const numberOfTotalZones = useMemo(() => {
    if (!regulatoryLayerLawTypes || !regulatoryLayerLawType || !regulatoryLayerTopic) {
      return 0
    }

    const regulatoryTopics = regulatoryLayerLawTypes[regulatoryLayerLawType]
    if (!regulatoryTopics) {
      return 0
    }

    return regulatoryTopics[regulatoryLayerTopic]?.length || 0
  }, [regulatoryLayerLawType, regulatoryLayerTopic, regulatoryLayerLawTypes])

  const areAllZonesAlreadySelected =
    selectedRegulatoryLayers && regulatoryLayerTopic
      ? selectedRegulatoryLayers[regulatoryLayerTopic]?.length === searchResultZonesLength
      : false

  const [zonesAreOpen, setZonesAreOpen] = useState(false)

  const areAllTopicZonesChecked = useMemo(() => {
    if (!regulatoryZonesChecked || !regulatoryLayerTopic) {
      return false
    }

    const zonesCheckedLength = regulatoryZonesChecked.filter(zone => zone.topic === regulatoryLayerTopic).length
    const allZonesLength = topicDetails.length
    if (!zonesCheckedLength || !allZonesLength) {
      return false
    }

    return zonesCheckedLength === allZonesLength
  }, [regulatoryZonesChecked, regulatoryLayerTopic, topicDetails])

  const handleCheckAllZones = () => {
    if (areAllZonesAlreadySelected) {
      return
    }

    if (areAllTopicZonesChecked) {
      dispatch(uncheckRegulatoryZones(searchResultZones))
    } else {
      dispatch(checkRegulatoryZones(searchResultZones))
    }
  }

  const areAllSearchedZonesChecked =
    !!selectedRegulatoryLayers &&
    !!regulatoryLayerTopic &&
    selectedRegulatoryLayers[regulatoryLayerTopic]?.length === searchResultZonesLength

  return (
    <>
      <LayerTopic>
        <TopicName
          data-cy="regulatory-layer-topic"
          onClick={() => setZonesAreOpen(!zonesAreOpen)}
          title={regulatoryLayerTopic}
        >
          {regulatoryLayerTopic}
        </TopicName>
        <ZonesNumber data-cy="regulatory-layer-topic-count">{`${topicDetails?.length}/${numberOfTotalZones}`}</ZonesNumber>
        <StyledCheckbox
          checked={!!((areAllTopicZonesChecked || areAllZonesAlreadySelected) && regulatoryLayerTopic)}
          label=""
          name={`${regulatoryLayerTopic}-checkbox`}
          onClick={handleCheckAllZones}
          readOnly={areAllSearchedZonesChecked}
        />
      </LayerTopic>
      <ResultZones
        regulatoryLayerLawType={regulatoryLayerLawType}
        regulatoryLayerTopic={regulatoryLayerTopic}
        zonesAreOpen={zonesAreOpen}
      />
    </>
  )
}

const StyledCheckbox = styled(Checkbox)`
  margin: 8px 2px 8px 8px;
`

const ZonesNumber = styled.span`
  font-size: 13px;
  color: ${THEME.color.slateGray};
  margin-left: auto;
  line-height: 34px;
  font-weight: 400;
`

const TopicName = styled.span`
  user-select: none;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  font-weight: 700;
  color: ${THEME.color.gunMetal};
  width: 300px;
  line-height: 33px;
`

const LayerTopic = styled.div`
  display: flex;
  user-select: none;
  text-overflow: ellipsis;
  overflow: hidden !important;
  height: 35px;
  padding-left: 18px;
  color: ${p => p.theme.color.gunMetal};
  border-bottom: 1px solid ${p => p.theme.color.lightGray};

  :hover {
    background: ${p => p.theme.color.blueGray25};
  }
`

export const ResultTopic = memo(UnmemoizedRegulatoryLayerSearchResultTopic)
