import { InteractionListener, InteractionType, LayerType as LayersType } from '@features/Map/constants'
import { regulationActions } from '@features/Regulation/slice'
import { useListenForDrawedGeometry } from '@hooks/useListenForDrawing'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { trackEvent } from '@hooks/useTracking'
import { Accent, Icon, IconButton, SingleTag, Size, TextInput, THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { resetZoneSelected, setAdvancedSearchIsOpen, setRegulatoryLayersSearchResult, setZoneSelected } from './slice'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { resetInteraction, setInteractionTypeAndListener } from '../../../Draw/slice'
import PolygonFilterSVG from '../../../icons/Filtre_zone_polygone.svg?react'
import PolygonFilterSelectedSVG from '../../../icons/Filtre_zone_polygone_selected.svg?react'
import BoxFilterSVG from '../../../icons/Filtre_zone_rectangle.svg?react'
import BoxFilterSelectedSVG from '../../../icons/Filtre_zone_rectangle_selected.svg?react'
import { MINIMUM_SEARCH_CHARACTERS_NUMBER, searchRegulatoryLayers } from '../../useCases/searchRegulatoryLayers'

import type { ZoneFilter } from '@features/Regulation/types'
import type { Polygon } from 'geojson'

export function SearchInput() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const { advancedSearchIsOpen, zoneSelected } = useMainAppSelector(state => state.regulatoryLayerSearch)

  const { drawedGeometry, interactionType } = useListenForDrawedGeometry(InteractionListener.REGULATION)
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const selectedOrSelectingZoneIsSquare = zoneSelected?.name === InteractionType.SQUARE
  const selectedOrSelectingZoneIsPolygon = zoneSelected?.name === InteractionType.POLYGON

  const saveEvent = useDebouncedCallback(() => {
    trackEvent({
      action: "Recherche d'une réglementation",
      category: 'Réglementation',
      name: isSuperUser ? 'CNSP' : 'EXT'
    })
  }, 2000)

  const search = useCallback(
    async (nextSearchQuery: string | undefined, nextZoneSelected: ZoneFilter | undefined) => {
      setSearchQuery(nextSearchQuery)

      if ((!nextSearchQuery || nextSearchQuery.length < MINIMUM_SEARCH_CHARACTERS_NUMBER) && !nextZoneSelected) {
        dispatch(setRegulatoryLayersSearchResult({}))

        return
      }

      const foundRegulatoryLayers = await dispatch(searchRegulatoryLayers(nextSearchQuery))

      dispatch(setRegulatoryLayersSearchResult(foundRegulatoryLayers))
      saveEvent()
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
    if (!selectedOrSelectingZoneIsPolygon) {
      dispatch(
        setInteractionTypeAndListener({
          listener: InteractionListener.REGULATION,
          type: InteractionType.SQUARE
        })
      )
    }
  }

  const drawPolygon = () => {
    if (!selectedOrSelectingZoneIsSquare) {
      dispatch(
        setInteractionTypeAndListener({
          listener: InteractionListener.REGULATION,
          type: InteractionType.POLYGON
        })
      )
    }
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
        <AdvancedSearchButton
          accent={Accent.PRIMARY}
          className={advancedSearchIsOpen ? '_active' : ''}
          data-cy="regulatory-layers-advanced-search"
          Icon={Icon.FilterBis}
          onClick={() => dispatch(setAdvancedSearchIsOpen(!advancedSearchIsOpen))}
          size={Size.LARGE}
          title="Ouvrir la recherche avancée"
        />
      </Search>
      <AdvancedSearchBox $advancedSearchIsOpen={advancedSearchIsOpen}>
        <SearchByGeometry>
          Définir une zone sur la carte <br />
          {selectedOrSelectingZoneIsSquare ? (
            <BoxFilterSelected data-cy="regulation-search-box-filter-selected" onClick={drawSquare} />
          ) : (
            <BoxFilter data-cy="regulation-search-box-filter" onClick={drawSquare} />
          )}
          {selectedOrSelectingZoneIsPolygon ? (
            <PolygonFilterSelected data-cy="regulation-search-polygon-filter-selected" onClick={drawPolygon} />
          ) : (
            <PolygonFilter data-cy="regulation-search-polygon-filter" onClick={drawPolygon} />
          )}
          {zoneSelected && (
            <InlineTagWrapper>
              <SingleTag
                onDelete={() => {
                  dispatch(resetZoneSelected())
                }}
              >
                Effacer la zone définie
              </SingleTag>
            </InlineTagWrapper>
          )}
        </SearchByGeometry>
      </AdvancedSearchBox>
    </>
  )
}

const InlineTagWrapper = styled.div`
  display: inline-block;
  margin-left: 5px;
  margin-top: 4px;
  vertical-align: top;
`

const SearchByGeometry = styled.div`
  color: #FF3392;
  font-size: 11px;
  font-weight: 300;
  margin: 2px 0 10px;
`

const boxFilterProperties = css`
  cursor: pointer;
  height: 30px;
  margin-top: 2px;
  vertical-align: text-bottom;
  width: 30px;
`

const polygonFilterProperties = css`
  cursor: pointer;
  height: 30px;
  margin-left: 5px;
  margin-top: 2px;
  vertical-align: text-bottom;
  width: 30px;
`

const BoxFilter = styled(BoxFilterSVG)`
  ${boxFilterProperties}
`

const PolygonFilter = styled(PolygonFilterSVG)`
  ${polygonFilterProperties}
`

const BoxFilterSelected = styled(BoxFilterSelectedSVG)`
  ${boxFilterProperties}
`

const PolygonFilterSelected = styled(PolygonFilterSelectedSVG)`
  ${polygonFilterProperties}
`

const AdvancedSearchBox = styled.div<{
  $advancedSearchIsOpen: boolean
}>`
  background-color: white;
  border-bottom: ${p => (p.$advancedSearchIsOpen ? 1 : 0)}px ${p => p.theme.color.lightGray} solid;
  height: ${p => (p.$advancedSearchIsOpen ? 50 : 0)}px;
  overflow: hidden;
  padding: ${p => (p.$advancedSearchIsOpen ? 10 : 0)}px 15px;
  text-align: left;
  transition: 0.5s all;
  width: 320px;
`

const Search = styled.div`
  display: flex;
  height: 40px;
  width: 100%;
  position: relative;
  box-shadow: 0px 3px 6px #70778540;
`

const StyledTextInput = styled(TextInput)`
  width: 310px;

  > div > input {
    color: ${THEME.color.gunMetal};
    height: 40px;
    padding-top: 12px;
  }
`

const AdvancedSearchButton = styled(IconButton)`
  display: inline-block;
  height: 40px;
  width: 40px;

  span {
    margin-left: -1px;
    margin-top: -1px;
  }
`
