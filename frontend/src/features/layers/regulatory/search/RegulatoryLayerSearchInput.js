import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { RegulatorySearchProperty } from '../../../../domain/entities/regulatory'
import searchRegulatoryLayers from '../../../../domain/use_cases/layer/regulation/searchRegulatoryLayers'
import { batch, useDispatch, useSelector } from 'react-redux'
import {
  resetRegulatoryZonesChecked,
  resetZoneSelected,
  setAdvancedSearchIsOpen,
  setRegulatoryLayersSearchResult
} from './RegulatoryLayerSearch.slice'
import { ReactComponent as SearchIconSVG } from '../../../icons/Loupe_dark.svg'
import { ReactComponent as CloseIconSVG } from '../../../icons/Croix_grise.svg'
import { ReactComponent as BoxFilterSVG } from '../../../icons/Filtre_zone_rectangle.svg'
import { ReactComponent as PolygonFilterSVG } from '../../../icons/Filtre_zone_polygone.svg'
import { ReactComponent as BoxFilterSelectedSVG } from '../../../icons/Filtre_zone_rectangle_selected.svg'
import { ReactComponent as PolygonFilterSelectedSVG } from '../../../icons/Filtre_zone_polygone_selected.svg'
import { setInteraction } from '../../../../domain/shared_slices/Map'
import { InteractionListener, InteractionType } from '../../../../domain/entities/map/constants'
import { LayerType } from '../../../../domain/entities/layers/constants'
import FilterTag from '../../../map/tools/vessel_filters/FilterTag'

const MINIMUM_SEARCH_CHARACTERS_NUMBER = 2

const RegulatoryLayerSearchInput = props => {
  const {
    initSearchFields,
    setInitSearchFields
  } = props
  const dispatch = useDispatch()
  const {
    advancedSearchIsOpen,
    zoneSelected
  } = useSelector(state => state.regulatoryLayerSearch)
  const {
    interaction
  } = useSelector(state => state.map)

  const [clickedOnSearch, setClickedOnSearch] = useState(null)
  const [nameSearchText, setNameSearchText] = useState('')
  const [placeSearchText, setPlaceSearchText] = useState('')
  const [gearSearchText, setGearSearchText] = useState('')
  const [speciesSearchText, setSpeciesSearchText] = useState('')
  const [regulatoryReferencesSearchText, setRegulatoryReferenceSearchText] = useState('')
  const selectedOrSelectingZoneIsSquare = JSON.parse(zoneSelected?.feature || '{}')?.properties?.type === InteractionType.SQUARE ||
    interaction?.type === InteractionType.SQUARE
  const selectedOrSelectingZoneIsPolygon = JSON.parse(zoneSelected?.feature || '{}')?.properties?.type === InteractionType.POLYGON ||
    interaction?.type === InteractionType.POLYGON

  const inputsAreEmpty = nameSearchText.length < MINIMUM_SEARCH_CHARACTERS_NUMBER &&
    placeSearchText.length < MINIMUM_SEARCH_CHARACTERS_NUMBER &&
    gearSearchText.length < MINIMUM_SEARCH_CHARACTERS_NUMBER &&
    regulatoryReferencesSearchText.length < MINIMUM_SEARCH_CHARACTERS_NUMBER &&
    speciesSearchText.length < MINIMUM_SEARCH_CHARACTERS_NUMBER

  useEffect(() => {
    if (initSearchFields) {
      setNameSearchText('')
      setPlaceSearchText('')
      setGearSearchText('')
      setSpeciesSearchText('')
      setRegulatoryReferenceSearchText('')
      setInitSearchFields(false)
    }
  }, [initSearchFields])

  useEffect(() => {
    if (!advancedSearchIsOpen) {
      setPlaceSearchText('')
      setGearSearchText('')
      setSpeciesSearchText('')
      setRegulatoryReferenceSearchText('')
      dispatch(resetZoneSelected())
    }
  }, [advancedSearchIsOpen])

  useEffect(() => {
    if (inputsAreEmpty && !zoneSelected) {
      batch(() => {
        dispatch(setRegulatoryLayersSearchResult({}))
        dispatch(resetRegulatoryZonesChecked())
      })
      return
    }

    const searchFields = {
      nameSearchText: {
        searchText: nameSearchText,
        properties: [RegulatorySearchProperty.TOPIC, RegulatorySearchProperty.ZONE]
      },
      placeSearchText: {
        searchText: placeSearchText,
        properties: [RegulatorySearchProperty.REGION]
      },
      gearSearchText: {
        searchText: gearSearchText,
        properties: [RegulatorySearchProperty.GEARS]
      },
      speciesSearchText: {
        searchText: speciesSearchText,
        properties: [RegulatorySearchProperty.SPECIES]
      },
      regulatoryReferencesSearchText: {
        searchText: regulatoryReferencesSearchText,
        properties: [RegulatorySearchProperty.REGULATORY_REFERENCES]
      }
    }

    batch(() => {
      dispatch(resetRegulatoryZonesChecked())
      dispatch(searchRegulatoryLayers(searchFields, inputsAreEmpty)).then(foundRegulatoryLayers => {
        dispatch(setRegulatoryLayersSearchResult(foundRegulatoryLayers))
      })
    })
  }, [
    inputsAreEmpty,
    nameSearchText,
    placeSearchText,
    speciesSearchText,
    gearSearchText,
    regulatoryReferencesSearchText,
    zoneSelected,
    clickedOnSearch
  ])

  const drawSquare = () => {
    if (!selectedOrSelectingZoneIsPolygon) {
      dispatch(setInteraction({
        type: InteractionType.SQUARE,
        listener: InteractionListener.REGULATION
      }))
    }
  }

  const drawPolygon = () => {
    if (!selectedOrSelectingZoneIsSquare) {
      dispatch(setInteraction({
        type: InteractionType.POLYGON,
        listener: InteractionListener.REGULATION
      }))
    }
  }

  return (
    <>
      <PrincipalSearchInput>
        <SearchBoxInput
          data-cy={'regulatory-search-input'}
          placeholder={'Rechercher une zone reg. par son nom'}
          type="text"
          value={nameSearchText}
          onClick={() => setClickedOnSearch({})}
          onChange={e => setNameSearchText(e.target.value)}
        />
        {
          inputsAreEmpty
            ? <SearchIcon/>
            : <CloseIcon
              data-cy={'regulatory-search-clean-input'}
              onClick={() => setInitSearchFields(true)}
            />
        }
        <AdvancedSearch
          data-cy={'regulatory-layers-advanced-search'}
          onClick={() => dispatch(setAdvancedSearchIsOpen(!advancedSearchIsOpen))}
          advancedSearchIsOpen={advancedSearchIsOpen}
        >
          {
            advancedSearchIsOpen
              ? '-'
              : '+'
          }
        </AdvancedSearch>
      </PrincipalSearchInput>
      <AdvancedSearchBox advancedSearchIsOpen={advancedSearchIsOpen}>
        <AdvancedSearchInput
          withoutMarginBottom
          data-cy={'regulatory-layers-advanced-search-zone'}
          placeholder={'Zone (ex. Med, Bretagne, mer Celtique…)'}
          type="text"
          value={placeSearchText}
          onChange={e => setPlaceSearchText(e.target.value)}
        />
        <SearchByGeometry>
          ou définir une zone sur la carte <br/>
          {
            selectedOrSelectingZoneIsSquare
              ? <BoxFilterSelected
                data-cy={'regulation-search-box-filter-selected'}
                onClick={drawSquare}
              />
              : <BoxFilter
                data-cy={'regulation-search-box-filter'}
                onClick={drawSquare}
              />
          }
          {
            selectedOrSelectingZoneIsPolygon
              ? <PolygonFilterSelected
                data-cy={'regulation-search-polygon-filter-selected'}
                onClick={drawPolygon}
              />
              : <PolygonFilter
                data-cy={'regulation-search-polygon-filter'}
                onClick={drawPolygon}
              />
          }
          {
            zoneSelected
              ? <InlineTagWrapper>
                  <FilterTag
                    key={zoneSelected.code}
                    value={'Effacer la zone définie'}
                    text={'Effacer la zone définie'}
                    removeTagFromFilter={() => dispatch(resetZoneSelected())}
                  />
                </InlineTagWrapper>
              : null
          }
        </SearchByGeometry>
        <AdvancedSearchInput
          data-cy={'regulatory-layers-advanced-search-gears'}
          placeholder={'Engins (ex. chaluts, casiers, FPO, GNS…)'}
          type="text"
          value={gearSearchText}
          onChange={e => setGearSearchText(e.target.value)}
        />
        <AdvancedSearchInput
          data-cy={'regulatory-layers-advanced-search-species'}
          placeholder={'Espèces (ex. merlu, coque, SCE, PIL...)'}
          type="text"
          value={speciesSearchText}
          onChange={e => setSpeciesSearchText(e.target.value)}
        />
        <AdvancedSearchInput
          data-cy={'regulatory-layers-advanced-search-reg'}
          placeholder={'Référence reg. (ex. 58/2007, 171/2020, 1241...)'}
          type="text"
          value={regulatoryReferencesSearchText}
          onChange={e => setRegulatoryReferenceSearchText(e.target.value)}
        />
      </AdvancedSearchBox>
    </>)
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

const AdvancedSearchBox = styled.div`
  background-color: white;
  height: ${props => props.advancedSearchIsOpen ? 210 : 0}px;
  width: 320px;
  transition: 0.5s all;
  padding: ${props => props.advancedSearchIsOpen ? 10 : 0}px 15px;
  overflow: hidden;
  text-align: left;
  border-bottom: ${props => props.advancedSearchIsOpen ? 1 : 0}px ${COLORS.lightGray} solid;
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
  border-bottom: 1px ${COLORS.lightGray} solid;

  :hover, :focus {
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

const AdvancedSearchInput = styled.input`
  border: none !important;
  border-bottom: 1px ${COLORS.lightGray} solid !important;
  background: ${p => p.theme.color.white} !important;
  overflow: none !important;
  width: 265px;
  margin: 5px 0 ${props => props.withoutMarginBottom ? 0 : 15}px 0 !important;
  font-size: 13px;
  color: ${COLORS.gunMetal};

  :hover, :focus {
    border-bottom: 1px ${COLORS.lightGray} solid;
  }
`

const AdvancedSearch = styled.div`
  width: 40px;
  height: 40px;
  float: right;
  background: ${props => props.advancedSearchIsOpen ? props.theme.color.blueGray[100] : props.theme.color.charcoal};
  cursor: pointer;
  font-size: 32px;
  line-height: 29px;
  color: ${COLORS.gainsboro};
  font-weight: 300;
  transition: 0.5s all;
`

export default RegulatoryLayerSearchInput
