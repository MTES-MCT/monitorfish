import { hideLayer } from '@features/LayersSidebar/useCases/hideLayer'
import { LayerProperties } from '@features/Map/constants'
import { regulationActions } from '@features/Regulation/slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Icon, IconButton, THEME } from '@mtes-mct/monitor-ui'
import { logSoftError } from '@utils/logSoftError'
import { memo, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ResultZones } from './ResultZones'

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

  const regulatoryLayerLawTypes = useMainAppSelector(state => state.regulation.regulatoryLayerLawTypes)
  const selectedRegulatoryLayers = useMainAppSelector(state => state.regulation.selectedRegulatoryLayers)
  const regulatoryLayersSearchResult = useMainAppSelector(
    state => state.regulatoryLayerSearch.regulatoryLayersSearchResult
  )
  const [areZonesOpened, setAreZonesOpened] = useState(false)

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

    return regulatoryTopics[regulatoryLayerTopic]?.length ?? 0
  }, [regulatoryLayerLawType, regulatoryLayerTopic, regulatoryLayerLawTypes])

  const areAllZonesAlreadySelected =
    selectedRegulatoryLayers && regulatoryLayerTopic
      ? selectedRegulatoryLayers[regulatoryLayerTopic]?.length === searchResultZonesLength
      : false

  const toggleCheckAllZones = () => {
    if (areAllZonesAlreadySelected && regulatoryLayerTopic) {
      dispatch(
        hideLayer({
          topic: regulatoryLayerTopic,
          type: LayerProperties.REGULATORY.code
        })
      )
      dispatch(regulationActions.removeSelectedZonesByTopic(regulatoryLayerTopic))

      return
    }

    dispatch(regulationActions.addRegulatoryZonesToMyLayers(searchResultZones))
  }

  return (
    <>
      <LayerTopic>
        <TopicName
          data-cy="regulatory-layer-topic"
          onClick={() => setAreZonesOpened(!areZonesOpened)}
          title={regulatoryLayerTopic}
        >
          {regulatoryLayerTopic}
        </TopicName>
        <ZonesNumber data-cy="regulatory-layer-topic-count">{`${topicDetails?.length}/${numberOfTotalZones}`}</ZonesNumber>
        <StyledIconButton
          accent={Accent.TERTIARY}
          aria-label={`Sélectionner "${regulatoryLayerTopic}"`}
          color={areAllZonesAlreadySelected ? THEME.color.blueGray : THEME.color.gunMetal}
          Icon={areAllZonesAlreadySelected ? Icon.PinFilled : Icon.Pin}
          onClick={toggleCheckAllZones}
          title={`Sélectionner "${regulatoryLayerTopic}"`}
        />
      </LayerTopic>
      <ResultZones
        areZonesOpened={areZonesOpened}
        regulatoryLayerLawType={regulatoryLayerLawType}
        regulatoryLayerTopic={regulatoryLayerTopic}
      />
    </>
  )
}

const StyledIconButton = styled(IconButton)`
  margin: 8px 2px 8px 2px;
`

const ZonesNumber = styled.span`
  font-size: 13px;
  color: #ff3392;
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

  &:hover {
    background: ${p => p.theme.color.blueGray25};
  }
`

export const ResultTopic = memo(UnmemoizedRegulatoryLayerSearchResultTopic)
