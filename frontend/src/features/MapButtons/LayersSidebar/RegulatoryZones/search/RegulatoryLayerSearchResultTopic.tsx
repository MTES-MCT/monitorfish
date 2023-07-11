import { memo, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Checkbox, CheckboxGroup } from 'rsuite'
import { RegulatoryLayerSearchResultZones } from './RegulatoryLayerSearchResultZones'
import { checkRegulatoryZones, uncheckRegulatoryZones } from './slice'
import { COLORS } from '../../../../../constants/constants'
import { closeRegulatoryZoneMetadata } from '../../../../../domain/use_cases/layer/regulation/closeRegulatoryZoneMetadata'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { stopMouseEventPropagation } from '@mtes-mct/monitor-ui'

export type RegulatoryLayerSearchResultTopicProps = {
  regulatoryLayerLawType?: string
  regulatoryLayerTopic?: string
  topicDetails: any
}
const UnmemoizedRegulatoryLayerSearchResultTopic = ({
  regulatoryLayerLawType,
  regulatoryLayerTopic,
  topicDetails
}: RegulatoryLayerSearchResultTopicProps) => {
  const dispatch = useMainAppDispatch()

  const regulatory = useMainAppSelector(state => state.regulatory)
  const regulatoryLayerSearch = useMainAppSelector(state => state.regulatoryLayerSearch)

  const { searchResultZones, searchResultZonesLength, regulatoryZonesChecked } = useMemo<{
    searchResultZones: any[]
    searchResultZonesLength: number
    regulatoryZonesChecked: any[]
  }>(() => {
    const defaultValue = {
      searchResultZones: [],
      searchResultZonesLength: 0,
      regulatoryZonesChecked: []
    }

    if (!regulatoryLayerSearch.regulatoryLayersSearchResult || !regulatoryLayerLawType || !regulatoryLayerTopic) {
      return defaultValue
    }
    const regulatoryLayer = regulatoryLayerSearch.regulatoryLayersSearchResult[regulatoryLayerLawType]
    if (!regulatoryLayer) {
      return defaultValue
    }

    const searchResultZones = regulatoryLayer[regulatoryLayerTopic]

    return {
      searchResultZones: searchResultZones,
      searchResultZonesLength: searchResultZones.length,
      regulatoryZonesChecked: regulatoryLayerSearch.regulatoryZonesChecked
    }
  }, [regulatoryLayerSearch])

  const numberOfTotalZones = useMemo(() => {
    if (!regulatory.selectedRegulatoryLayers || !regulatoryLayerLawType || !regulatoryLayerTopic) {
      return 0
    }

    const regulatoryLayer = regulatory.selectedRegulatoryLayers[regulatoryLayerLawType]
    if (!regulatoryLayer) {
      return 0
    }

    return regulatoryLayer[regulatoryLayerTopic]?.length || 0
  }, [regulatory])

  const allZonesAreAlreadySelected =
    regulatory.selectedRegulatoryLayers && regulatoryLayerTopic
      ? regulatory.selectedRegulatoryLayers[regulatoryLayerTopic]?.length === searchResultZonesLength
      : false

  const [zonesAreOpen, setZonesAreOpen] = useState(false)

  useEffect(() => {
    if (!zonesAreOpen && regulatory.regulatoryZoneMetadata?.topic === regulatoryLayerTopic) {
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

    return zonesCheckedLength === allZonesLength
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
          onClick={stopMouseEventPropagation}
          inline
          name="checkboxList"
          value={
            (allTopicZonesAreChecked || allZonesAreAlreadySelected) && regulatoryLayerTopic
              ? [regulatoryLayerTopic]
              : []
          }
          onChange={handleCheckAllZones}
          style={{ marginLeft: 0, height: 20 }}
        >
          <Checkbox
            disabled={
              (regulatory.selectedRegulatoryLayers &&
                regulatoryLayerTopic &&
                regulatory.selectedRegulatoryLayers[regulatoryLayerTopic]?.length === searchResultZonesLength) ||
              false
            }
            title={allZonesAreAlreadySelected ? 'zones déjà ajoutées à mes zones réglementaires' : ''}
            value={String(regulatoryLayerTopic)}
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
  color: ${p => p.theme.color.gunMetal};
  border-bottom: 1px solid ${p => p.theme.color.lightGray};

  :hover {
    background: ${p => p.theme.color.blueGray['25']};
  }

  .rs-checkbox-checker {
    padding-top: 24px;
  }

  .rs-checkbox {
    margin-left: 0;
  }
`

export const RegulatoryLayerSearchResultTopic = memo(UnmemoizedRegulatoryLayerSearchResultTopic)
