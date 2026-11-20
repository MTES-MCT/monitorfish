import { InteractionListener, InteractionType, LayerType as LayersType } from '@features/Map/constants'
import { regulationActions } from '@features/Regulation/slice'
import { useListenForDrawedGeometry } from '@hooks/useListenForDrawing'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { trackEvent, trackSiteSearch } from '@hooks/useTracking'
import { Accent, Button, Icon, SingleTag, Size, TextInput, THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { resetZoneSelected, setRegulatoryLayersSearchResult, setZoneSelected } from './slice'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { resetInteraction, setInteractionTypeAndListener } from '../../../Draw/slice'
import { MINIMUM_SEARCH_CHARACTERS_NUMBER, searchRegulatoryLayers } from '../../useCases/searchRegulatoryLayers'
import { countRegulatoryZones } from '../../utils'

import type { RegulatoryLawTypes, ZoneFilter } from '@features/Regulation/types'
import type { Polygon } from 'geojson'

export function SearchInput() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const { advancedSearchIsOpen, zoneSelected } = useMainAppSelector(state => state.regulatoryLayerSearch)

  const { drawedGeometry, interactionType } = useListenForDrawedGeometry(InteractionListener.REGULATION)
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)

  const saveEvent = useDebouncedCallback(
    (
      nextSearchQuery: string | undefined,
      nextZoneSelected: ZoneFilter | undefined,
      foundRegulatoryLayers: RegulatoryLawTypes | undefined
    ) => {
      trackEvent({
        action: "Recherche d'une réglementation",
        category: 'Réglementation',
        name: isSuperUser ? 'CNSP' : 'EXT'
      })

      if (nextSearchQuery && nextSearchQuery.length >= MINIMUM_SEARCH_CHARACTERS_NUMBER) {
        trackSiteSearch(
          nextSearchQuery.trim(),
          nextZoneSelected ? 'Réglementation (zone définie sur la carte)' : 'Réglementation',
          countRegulatoryZones(foundRegulatoryLayers)
        )
      }
    },
    2000
  )

  const search = useCallback(
    async (nextSearchQuery: string | undefined, nextZoneSelected: ZoneFilter | undefined) => {
      setSearchQuery(nextSearchQuery)

      if ((!nextSearchQuery || nextSearchQuery.length < MINIMUM_SEARCH_CHARACTERS_NUMBER) && !nextZoneSelected) {
        dispatch(setRegulatoryLayersSearchResult({}))

        return
      }

      const foundRegulatoryLayers = await dispatch(searchRegulatoryLayers(nextSearchQuery))

      dispatch(setRegulatoryLayersSearchResult(foundRegulatoryLayers))
      saveEvent(nextSearchQuery, nextZoneSelected, foundRegulatoryLayers)
    },
    [dispatch, saveEvent]
  )

  useEffect(() => {
    search(searchQuery, zoneSelected)
  }, [search, searchQuery, zoneSelected])

  useEffect(() => {
    if (searchQuery === undefined) {
      dispatch(regulationActions.closeRegulatoryZoneMetadataPanel())
    }
  }, [dispatch, searchQuery])

  useEffect(() => {
    if (!advancedSearchIsOpen) {
      dispatch(resetZoneSelected())
    }
  }, [dispatch, advancedSearchIsOpen])

  useEffect(
    () => () => {
      dispatch(resetZoneSelected())
    },
    [dispatch]
  )

  useEffect(() => {
    if (!drawedGeometry) {
      return
    }

    dispatch(
      setZoneSelected({
        code: LayersType.FREE_DRAW,
        feature: drawedGeometry as Polygon,
        name: interactionType?.toString() ?? ''
      })
    )
    dispatch(resetInteraction())
  }, [dispatch, drawedGeometry, interactionType])

  const drawSquare = () => {
    dispatch(
      setInteractionTypeAndListener({
        listener: InteractionListener.REGULATION,
        type: InteractionType.SQUARE
      })
    )
  }

  const resetZone = () => {
    dispatch(resetZoneSelected())
  }

  return (
    <>
      <Search>
        <StyledTextInput
          isLabelHidden
          isLight
          isSearchInput
          label="Rechercher une zone réglementaire"
          name="Rechercher une zone réglementaire"
          onChange={setSearchQuery}
          placeholder="Rechercher une zone réglementaire"
          size={Size.LARGE}
          value={searchQuery}
        />
      </Search>
      <AdvancedSearchBox>
        <Button
          accent={Accent.SECONDARY}
          Icon={Icon.SelectRectangle}
          onClick={drawSquare}
          title="Définir une zone de recherche sur la carte"
        >
          Définir une zone de recherche sur la carte
        </Button>
        {zoneSelected && <SingleTag onDelete={resetZone}>{`Zone de recherche`}</SingleTag>}
      </AdvancedSearchBox>
    </>
  )
}

const AdvancedSearchBox = styled.div`
  background-color: white;
  border-bottom: 1px ${p => p.theme.color.lightGray} solid;
  overflow: hidden;
  padding: 8px;
  text-align: left;
  width: 334px;

  .Element-Button {
    width: inherit;
    height: 30px;
  }

  .Element-SingleTag {
    margin-top: 4px;
    width: 100%;

    span {
      width: 100%;
    }
  }
`

const Search = styled.div`
  display: flex;
  height: 40px;
  width: 100%;
  position: relative;
  border-bottom: 2px ${p => p.theme.color.lightGray} solid;
`

const StyledTextInput = styled(TextInput)`
  width: 100%;

  > div > input {
    color: ${THEME.color.gunMetal};
    height: 40px;
    padding-top: 12px;
  }
`
