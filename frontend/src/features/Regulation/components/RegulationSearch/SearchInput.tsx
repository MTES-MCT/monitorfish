import { Icon, IconButton, SingleTag, Size } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import {
  resetRegulatoryZonesChecked,
  resetZoneSelected,
  setAdvancedSearchIsOpen,
  setRegulatoryLayersSearchResult,
  setZoneSelected
} from './slice'
import { LayerType as LayersType } from '../../../../domain/entities/layers/constants'
import { InteractionListener, InteractionType } from '../../../../domain/entities/map/constants'
import { useListenForDrawedGeometry } from '../../../../hooks/useListenForDrawing'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { theme } from '../../../../ui/theme'
import { resetInteraction, setInteractionTypeAndListener } from '../../../Draw/slice'
import CloseIconSVG from '../../../icons/Croix_grise.svg?react'
import PolygonFilterSVG from '../../../icons/Filtre_zone_polygone.svg?react'
import PolygonFilterSelectedSVG from '../../../icons/Filtre_zone_polygone_selected.svg?react'
import BoxFilterSVG from '../../../icons/Filtre_zone_rectangle.svg?react'
import BoxFilterSelectedSVG from '../../../icons/Filtre_zone_rectangle_selected.svg?react'
import SearchIconSVG from '../../../icons/Loupe_dark.svg?react'
import { closeRegulatoryZoneMetadataPanel } from '../../slice'
import { MINIMUM_SEARCH_CHARACTERS_NUMBER, searchRegulatoryLayers } from '../../useCases/searchRegulatoryLayers'

import type { IconButtonProps } from '@mtes-mct/monitor-ui'

export function SearchInput() {
  const dispatch = useMainAppDispatch()
  const { advancedSearchIsOpen, zoneSelected } = useMainAppSelector(state => state.regulatoryLayerSearch)

  const { drawedGeometry, interactionType } = useListenForDrawedGeometry(InteractionListener.REGULATION)
  const [searchQuery, setSearchQuery] = useState('')
  const selectedOrSelectingZoneIsSquare = zoneSelected?.name === InteractionType.SQUARE
  const selectedOrSelectingZoneIsPolygon = zoneSelected?.name === InteractionType.POLYGON

  const closeSearch = useCallback(() => {
    setSearchQuery('')
    dispatch(closeRegulatoryZoneMetadataPanel())
  }, [dispatch])

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
    if (searchQuery?.length < MINIMUM_SEARCH_CHARACTERS_NUMBER && !zoneSelected) {
      dispatch(setRegulatoryLayersSearchResult({}))
      dispatch(resetRegulatoryZonesChecked())

      return
    }

    dispatch(resetRegulatoryZonesChecked())
    dispatch(searchRegulatoryLayers(searchQuery)).then(foundRegulatoryLayers => {
      dispatch(setRegulatoryLayersSearchResult(foundRegulatoryLayers))
    })
  }, [dispatch, searchQuery, zoneSelected])

  useEffect(() => {
    if (!drawedGeometry) {
      return
    }

    dispatch(
      setZoneSelected({
        code: LayersType.FREE_DRAW,
        feature: drawedGeometry,
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
      <PrincipalSearchInput>
        <SearchBoxInput
          data-cy="regulatory-search-input"
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher une zone réglementaire"
          type="text"
          value={searchQuery}
        />
        {searchQuery?.length > MINIMUM_SEARCH_CHARACTERS_NUMBER ? (
          <CloseIcon data-cy="regulatory-search-clean-input" onClick={closeSearch} />
        ) : (
          <SearchIcon />
        )}
        <AdvancedSearch
          advancedSearchIsOpen={advancedSearchIsOpen}
          color={theme.color.gainsboro}
          data-cy="regulatory-layers-advanced-search"
          Icon={Icon.FilterBis}
          onClick={() => dispatch(setAdvancedSearchIsOpen(!advancedSearchIsOpen))}
          size={Size.LARGE}
          title="Ouvrir la recherche avancée"
        />
      </PrincipalSearchInput>
      <AdvancedSearchBox advancedSearchIsOpen={advancedSearchIsOpen}>
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
  color: ${p => p.theme.color.slateGray};
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
  advancedSearchIsOpen: boolean
}>`
  background-color: white;
  border-bottom: ${p => (p.advancedSearchIsOpen ? 1 : 0)}px ${p => p.theme.color.lightGray} solid;
  height: ${p => (p.advancedSearchIsOpen ? 50 : 0)}px;
  overflow: hidden;
  padding: ${p => (p.advancedSearchIsOpen ? 10 : 0)}px 15px;
  text-align: left;
  transition: 0.5s all;
  width: 320px;
`

const PrincipalSearchInput = styled.div`
  display: flex;
  height: 40px;
  width: 100%;
  position: relative;
  box-shadow: 0px 3px 6px #70778540;
`

const SearchBoxInput = styled.input`
  background-color: white;
  border: none;
  border-bottom: 1px ${p => p.theme.color.lightGray} solid;
  border-radius: 0;
  color: ${p => p.theme.color.gunMetal};
  font-size: 13px;
  height: 39px;
  margin: 0;
  padding: 0 5px 0 10px;
  vertical-align: bottom;
  width: 270px;

  :hover,
  :focus {
    border-bottom: 1px ${p => p.theme.color.slateGray} solid;
  }
`

const SearchIcon = styled(SearchIconSVG)`
  background: ${p => p.theme.color.white};
  border-bottom: 1px ${p => p.theme.color.lightGray} solid;
  height: 29px;
  padding-left: 10px;
  padding-top: 10px;
  vertical-align: top;
  width: 30px;
`

const CloseIcon = styled(CloseIconSVG)`
  background: ${p => p.theme.color.white};
  border-bottom: 1px ${p => p.theme.color.lightGray} solid;
  cursor: pointer;
  height: 17px;
  padding: 13px 11px 9px 9px;
  vertical-align: top;
  width: 20px;
`

const AdvancedSearch = styled(IconButton)<
  IconButtonProps & {
    advancedSearchIsOpen?: boolean
  }
>`
  background: ${p => (p.advancedSearchIsOpen ? p.theme.color.blueYonder : p.theme.color.charcoal)};
  display: inline-block;
  height: 40px;
  width: 40px;

  div {
    margin-left: -1px;
    margin-top: -1px;
  }

  :hover,
  :focus,
  :active {
    background: ${p => (p.advancedSearchIsOpen ? p.theme.color.blueYonder : p.theme.color.charcoal)};
  }
`
