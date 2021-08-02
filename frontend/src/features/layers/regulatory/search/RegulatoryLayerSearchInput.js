import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import SearchIconSVG from '../../../icons/Loupe_dark.svg'
import { REGULATORY_SEARCH_PROPERTIES } from '../../../../domain/entities/regulatory'
import searchRegulatoryLayers from '../../../../domain/use_cases/searchRegulatoryLayers'
import { useDispatch } from 'react-redux'

const RegulatoryLayerSearchInput = props => {
  const {
    initSearchFields,
    setInitSearchFields,
    setFoundRegulatoryLayers,
    resetSelectedRegulatoryLayer,
    regulatoryLayers
  } = props
  const dispatch = useDispatch()

  const [advancedSearchIsOpen, setAdvancedSearchIsOpen] = useState(false)
  const [nameSearchText, setNameSearchText] = useState('')
  const [placeSearchText, setPlaceSearchText] = useState('')
  const [gearSearchText, setGearSearchText] = useState('')
  const [speciesSearchText, setSpeciesSearchText] = useState('')
  const [regulatoryReferencesSearchText, setRegulatoryReferenceSearchText] = useState('')

  useEffect(() => {
    if (initSearchFields) {
      setPlaceSearchText('')
      setNameSearchText('')
      setGearSearchText('')
      setSpeciesSearchText('')
      setRegulatoryReferenceSearchText('')
      setInitSearchFields(false)
    }
  }, [initSearchFields])

  const searchFields = {
    nameSearchText: {
      searchText: nameSearchText,
      properties: [REGULATORY_SEARCH_PROPERTIES.TOPIC, REGULATORY_SEARCH_PROPERTIES.ZONE]
    },
    placeSearchText: {
      searchText: placeSearchText,
      properties: [REGULATORY_SEARCH_PROPERTIES.REGION, REGULATORY_SEARCH_PROPERTIES.SEAFRONT]
    },
    gearSearchText: {
      searchText: gearSearchText,
      properties: [REGULATORY_SEARCH_PROPERTIES.GEARS]
    },
    speciesSearchText: {
      searchText: speciesSearchText,
      properties: [REGULATORY_SEARCH_PROPERTIES.SPECIES]
    },
    regulatoryReferencesSearchText: {
      searchText: regulatoryReferencesSearchText,
      properties: [REGULATORY_SEARCH_PROPERTIES.REGULATORY_REFERENCES]
    }
  }

  useEffect(() => {
    if (nameSearchText.length < 1 &&
      placeSearchText.length < 1 &&
      gearSearchText.length < 1 &&
      regulatoryReferencesSearchText.length < 1 &&
      speciesSearchText.length < 1) {
      setFoundRegulatoryLayers({})
      return
    }

    resetSelectedRegulatoryLayer()
    dispatch(searchRegulatoryLayers(searchFields, regulatoryLayers)).then(foundRegulatoryLayers => {
      setFoundRegulatoryLayers(foundRegulatoryLayers)
    })
  }, [nameSearchText, placeSearchText, speciesSearchText, gearSearchText, regulatoryReferencesSearchText])

  return (
    <>
      <PrincipalSearchInput>
        <SearchBoxInput
          type="text"
          value={nameSearchText}
          placeholder={'Rechercher une zone reg. par son nom'}
          onChange={e => setNameSearchText(e.target.value)}/>
        <AdvancedSearch onClick={() => setAdvancedSearchIsOpen(!advancedSearchIsOpen)}>+</AdvancedSearch>
      </PrincipalSearchInput>
      <AdvancedSearchBox advancedSearchIsOpen={advancedSearchIsOpen}>
      </AdvancedSearchBox>
      </>)
}

const AdvancedSearchBox = styled.div`
  background: ${COLORS.background};
  height: ${props => props.advancedSearchIsOpen ? 238 : 0}px;
  width: 350px;
  transition: 0.5s all;
`

const PrincipalSearchInput = styled.div`
  height: 40px;
  width: 100%;
`

const SearchBoxInput = styled.input`
  margin: 0;
  background-color: white;
  border: none;
  border-bottom: 1px ${COLORS.gray} solid;
  border-radius: 0;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  height: 40px;
  width: 310px;
  padding: 0 5px 0 10px;
  flex: 3;
  background-image: url(${SearchIconSVG});
  background-size: 30px;
  background-position: bottom 3px right 5px;
  background-repeat: no-repeat;
  
  :hover, :focus {
    border-bottom: 1px ${COLORS.gray} solid;
  }
`

const AdvancedSearch = styled.div`
  width: 40px;
  height: 40px;
  float: right;
  background: ${COLORS.charcoal};
  cursor: pointer;
  font-size: 32px;
  line-height: 29px;
  color: ${COLORS.gainsboro};
`

export default RegulatoryLayerSearchInput
