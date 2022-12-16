import { Icon, IconButton, Size } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { LayerType as LayersType } from '../../../../domain/entities/layers/constants'
import { InteractionListener, InteractionType } from '../../../../domain/entities/map/constants'
import { resetInteraction, setInteractionTypeAndListener } from '../../../../domain/shared_slices/Draw'
import { closeRegulatoryZoneMetadataPanel } from '../../../../domain/shared_slices/Regulatory'
import {
  MINIMUM_SEARCH_CHARACTERS_NUMBER,
  searchRegulatoryLayers
} from '../../../../domain/use_cases/layer/regulation/searchRegulatoryLayers'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { useListenForDrawedGeometry } from '../../../../hooks/useListenForDrawing'
import { theme } from '../../../../ui/theme'
import { ReactComponent as CloseIconSVG } from '../../../icons/Croix_grise.svg'
import { ReactComponent as PolygonFilterSVG } from '../../../icons/Filtre_zone_polygone.svg'
import { ReactComponent as PolygonFilterSelectedSVG } from '../../../icons/Filtre_zone_polygone_selected.svg'
import { ReactComponent as BoxFilterSVG } from '../../../icons/Filtre_zone_rectangle.svg'
import { ReactComponent as BoxFilterSelectedSVG } from '../../../icons/Filtre_zone_rectangle_selected.svg'
import { ReactComponent as SearchIconSVG } from '../../../icons/Loupe_dark.svg'
import FilterTag from '../../../map/tools/vessel_filters/FilterTag'
import {
  resetRegulatoryZonesChecked,
  resetZoneSelected,
  setAdvancedSearchIsOpen,
  setRegulatoryLayersSearchResult,
  setZoneSelected
} from './RegulatoryLayerSearch.slice'

import type { IconButtonProps } from '@mtes-mct/monitor-ui/elements/IconButton'

export function RegulatoryLayerSearchInput() {
  const dispatch = useAppDispatch()
  const { advancedSearchIsOpen, zoneSelected } = useAppSelector(state => state.regulatoryLayerSearch)

  const { geometry, interactionType } = useListenForDrawedGeometry(InteractionListener.REGULATION)
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
    if (!geometry) {
      return
    }

    dispatch(
      setZoneSelected({
        code: LayersType.FREE_DRAW,
        feature: geometry,
        name: interactionType?.toString() || ''
      })
    )
    dispatch(resetInteraction())
  }, [dispatch, geometry, interactionType])

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
              <FilterTag
                key={zoneSelected.code}
                iconElement={undefined}
                removeTagFromFilter={() => dispatch(resetZoneSelected())}
                text="Effacer la zone définie"
                type={undefined}
                uuid={undefined}
                value="Effacer la zone définie"
              />
            </InlineTagWrapper>
          )}
        </SearchByGeometry>
      </AdvancedSearchBox>
    </>
  )
}

const InlineTagWrapper = styled.div`
  display: inline-block;
  vertical-align: top;
  margin-left: 5px;
  margin-top: 2px;
`

const SearchByGeometry = styled.div`
  color: ${COLORS.slateGray};
  margin: 2px 0 10px 0;
  font-weight: 300;
  font-size: 11px;
`

const boxFilterProperties = css`
  width: 30px;
  height: 30px;
  cursor: pointer;
  margin-top: 2px;
  vertical-align: text-bottom;
`

const polygonFilterProperties = css`
  width: 30px;
  height: 30px;
  cursor: pointer;
  margin-left: 5px;
  margin-top: 2px;
  vertical-align: text-bottom;
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
  height: ${p => (p.advancedSearchIsOpen ? 50 : 0)}px;
  width: 320px;
  transition: 0.5s all;
  padding: ${p => (p.advancedSearchIsOpen ? 10 : 0)}px 15px;
  overflow: hidden;
  text-align: left;
  border-bottom: ${p => (p.advancedSearchIsOpen ? 1 : 0)}px ${COLORS.lightGray} solid;
`

const PrincipalSearchInput = styled.div`
  height: 40px;
  width: 100%;
`

const SearchBoxInput = styled.input`
  margin: 0;
  background-color: white;
  border: none;
  border-radius: 0;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  height: 40px;
  width: 270px;
  padding: 0 5px 0 10px;
  vertical-align: bottom;
  border-bottom: 1px ${COLORS.lightGray} solid;

  :hover,
  :focus {
    border-bottom: 1px ${COLORS.slateGray} solid;
  }
`

const SearchIcon = styled(SearchIconSVG)`
  width: 30px;
  padding-left: 10px;
  height: 29px;
  padding-top: 10px;
  background: ${p => p.theme.color.white};
  vertical-align: top;
  border-bottom: 1px ${COLORS.lightGray} solid;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 20px;
  padding: 13px 11px 9px 9px;
  height: 17px;
  background: ${p => p.theme.color.white};
  vertical-align: top;
  border-bottom: 1px ${COLORS.lightGray} solid;
  cursor: pointer;
`

const AdvancedSearch = styled(IconButton)<
  IconButtonProps & {
    advancedSearchIsOpen?: boolean
  }
>`
  display: inline-block;
  height: 40px;
  width: 40px;
  background: ${p => (p.advancedSearchIsOpen ? p.theme.color.blueYonder['100'] : p.theme.color.charcoal)};
  border: unset;
  div {
    margin-top: -1px;
    margin-left: -1px;
  }

  :hover,
  :focus,
  :active {
    background: ${p => (p.advancedSearchIsOpen ? p.theme.color.blueYonder['100'] : p.theme.color.charcoal)};
  }
`
