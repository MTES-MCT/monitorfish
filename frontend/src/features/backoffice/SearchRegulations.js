import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import { ReactComponent as SearchIconSVG } from '../icons/Loupe.svg'
import { COLORS } from '../../constants/constants'
import { AddRegulationButton } from '../commonStyles/Buttons.style'
import { searchByLawType } from '../../domain/entities/regulatory'
import { BACKOFFICE_SEARCH_PROPERTIES } from '../../domain/entities/backoffice'
import { setRegulatoryZoneToEdit } from '../../domain/shared_slices/Regulatory'

const SearchRegulations = props => {
  const {
    setFoundRegulatoryZonesByRegTerritory,
    regulatoryZoneListByRegTerritory
  } = props

  const searchInput = useRef(null)
  const [searchText, setSearchText] = useState('')
  const dispatch = useDispatch()

  useEffect(() => {
    searchRegulatoryZone()
  }, [searchText, setFoundRegulatoryZonesByRegTerritory, regulatoryZoneListByRegTerritory])

  useEffect(() => {
    if (searchInput) {
      searchInput.current.focus()
    }
  }, [])

  const searchRegulatoryZone = () => {
    const searchResult = {}
    if (searchText === '') {
      setFoundRegulatoryZonesByRegTerritory(regulatoryZoneListByRegTerritory)
    } else {
      Object.keys(regulatoryZoneListByRegTerritory).forEach(territory => {
        const searchResultByLawType = searchByLawType(regulatoryZoneListByRegTerritory[territory], BACKOFFICE_SEARCH_PROPERTIES, searchText)
        if (searchResultByLawType && Object.keys(searchResultByLawType).length !== 0) {
          searchResult[territory] = searchResultByLawType
        }
      })
      setFoundRegulatoryZonesByRegTerritory(searchResult)
    }
  }

  const history = useHistory()

  const onAddRegulationClick = () => {
    history.push('/backoffice/regulation/new')
    dispatch(setRegulatoryZoneToEdit)
  }

  return (
    <SearchContainer>
      <SearchBox>
        <SearchBoxInput
          ref={searchInput}
          type="text"
          value={searchText}
          placeholder={'Rechercher une zone par son nom ou sa référence réglementaire'}
          onChange={e => setSearchText(e.target.value)} />
        <SearchIcon />
        </SearchBox>
        <AddRegulationButton
          onClick={onAddRegulationClick}
          disabled={false}
          isLast={false}
          title={'Saisir une nouvelle réglementation'}
        />
    </SearchContainer>
  )
}

const SearchContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 25px 40px 0;
  background-color: white;
`

const SearchBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px ${COLORS.lightGray} solid;
  border-radius: 0;
  background-color: white;
  margin-right: 10px;
  width: 100%;
`

const SearchBoxInput = styled.input`
  margin: 0;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  height: 40px;
  width: 100%;
  padding: 0 5px 0 10px;
  background-color: white;
  border: none;
`

const SearchIcon = styled(SearchIconSVG)`
  width: 24px;
  height: 24px;
  margin-top: 2px;
  margin-right: 8px;
  float: right;
  color: ${COLORS.lightGray}
`

export default SearchRegulations
