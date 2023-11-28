import { logSoftError, stopMouseEventPropagation } from '@mtes-mct/monitor-ui'
import { memo, useMemo, useState } from 'react'
import { Checkbox, CheckboxGroup } from 'rsuite'
import styled from 'styled-components'

import { RegulatoryLayerSearchResultZones } from './RegulatoryLayerSearchResultZones'
import { checkRegulatoryZones, uncheckRegulatoryZones } from './slice'
import { COLORS } from '../../../../../constants/constants'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'

import type { RegulatoryZone } from '../../../types'

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

  const regulatory = useMainAppSelector(state => state.regulatory)
  const regulatoryLayerSearch = useMainAppSelector(state => state.regulatoryLayerSearch)

  const { regulatoryZonesChecked, searchResultZones, searchResultZonesLength } = useMemo<{
    regulatoryZonesChecked: any[]
    searchResultZones: any[]
    searchResultZonesLength: number
  }>(() => {
    const defaultValue = {
      regulatoryZonesChecked: [],
      searchResultZones: [],
      searchResultZonesLength: 0
    }

    if (!regulatoryLayerSearch.regulatoryLayersSearchResult || !regulatoryLayerLawType || !regulatoryLayerTopic) {
      return defaultValue
    }
    const regulatoryLayer = regulatoryLayerSearch.regulatoryLayersSearchResult[regulatoryLayerLawType]
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
      regulatoryZonesChecked: regulatoryLayerSearch.regulatoryZonesChecked,
      searchResultZones: _searchResultZones,
      searchResultZonesLength: _searchResultZones.length
    }
  }, [regulatoryLayerSearch, regulatoryLayerLawType, regulatoryLayerTopic])

  const numberOfTotalZones = useMemo(() => {
    if (!regulatory.selectedRegulatoryLayers || !regulatoryLayerLawType || !regulatoryLayerTopic) {
      return 0
    }

    const regulatoryLayer = regulatory.selectedRegulatoryLayers[regulatoryLayerLawType]
    if (!regulatoryLayer) {
      return 0
    }

    return regulatoryLayer[regulatoryLayerTopic]?.length || 0
  }, [regulatory, regulatoryLayerLawType, regulatoryLayerTopic])

  const allZonesAreAlreadySelected =
    regulatory.selectedRegulatoryLayers && regulatoryLayerTopic
      ? regulatory.selectedRegulatoryLayers[regulatoryLayerTopic]?.length === searchResultZonesLength
      : false

  const [zonesAreOpen, setZonesAreOpen] = useState(false)

  const allTopicZonesAreChecked = useMemo(() => {
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
    if (allTopicZonesAreChecked) {
      dispatch(uncheckRegulatoryZones(searchResultZones))
    } else {
      dispatch(checkRegulatoryZones(searchResultZones))
    }
  }

  return (
    <>
      <LayerTopic onClick={() => setZonesAreOpen(!zonesAreOpen)}>
        <TopicName data-cy="regulatory-layer-topic" title={regulatoryLayerTopic}>
          {regulatoryLayerTopic}
        </TopicName>
        <ZonesNumber>{`${topicDetails?.length}/${numberOfTotalZones}`}</ZonesNumber>
        <CheckboxGroup
          inline
          name="checkboxList"
          onChange={handleCheckAllZones}
          onClick={stopMouseEventPropagation}
          style={{ height: 20, marginLeft: 0 }}
          value={
            (allTopicZonesAreChecked || allZonesAreAlreadySelected) && regulatoryLayerTopic
              ? [regulatoryLayerTopic]
              : []
          }
        >
          {/* TODO This is strange: a single checkbox in a group? */}
          {[
            <Checkbox
              key={regulatoryLayerTopic}
              disabled={
                (regulatory.selectedRegulatoryLayers &&
                  regulatoryLayerTopic &&
                  regulatory.selectedRegulatoryLayers[regulatoryLayerTopic]?.length === searchResultZonesLength) ||
                false
              }
              title={allZonesAreAlreadySelected ? 'zones déjà ajoutées à mes zones réglementaires' : ''}
              value={String(regulatoryLayerTopic)}
            />
          ]}
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
  color: ${p => p.theme.color.gunMetal};
  border-bottom: 1px solid ${p => p.theme.color.lightGray};

  :hover {
    background: ${p => p.theme.color.blueGray25};
  }

  .rs-checkbox-checker {
    padding-top: 24px;
  }

  .rs-checkbox {
    margin-left: 0;
  }
`

export const RegulatoryLayerSearchResultTopic = memo(UnmemoizedRegulatoryLayerSearchResultTopic)
