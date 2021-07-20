import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useRouteMatch } from 'react-router-dom'
import { ReactComponent as SearchIconSVG } from '../icons/Loupe.svg'
import { search } from '../../utils'
import { COLORS, BACKOFFICE_SEARCH_PROPERTIES } from '../../constants/constants'
import { AddRegulationButton } from '../commonStyles/Buttons.style'

const SearchRegulations = props => {
  const {
    setFoundRegulatoryZonesByRegTerritory,
    regulatoryZoneListByRegTerritory
  } = props

  const searchInput = useRef(null)
  const [searchText, setSearchText] = useState('')

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
        const searchResultByLawType = {}
        Object.keys(regulatoryZoneListByRegTerritory[territory]).forEach(lawType => {
          const regulatoryZone = Object.assign({}, regulatoryZoneListByRegTerritory[territory][lawType])
          const foundRegulatoryZones = search(searchText, BACKOFFICE_SEARCH_PROPERTIES, regulatoryZone)
          if (foundRegulatoryZones && Object.keys(foundRegulatoryZones).length !== 0) {
            searchResultByLawType[lawType] = foundRegulatoryZones
          }
        })
        if (searchResultByLawType && Object.keys(searchResultByLawType).length !== 0) {
          searchResult[territory] = searchResultByLawType
        }
      })
      setFoundRegulatoryZonesByRegTerritory(searchResult)
    }
  }

  const match = useRouteMatch()
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
          to={match.url + '/newRegulation'}
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
  border: 1px ${COLORS.grayDarker} solid;
  border-radius: 0;
  background-color: white;
  margin-right: 10px;
  width: 100%;
`

const SearchBoxInput = styled.input`
  margin: 0;
  color: ${COLORS.charcoal};
  font-size: 0.8em;
  height: 40px;
  width: 100%;
  padding: 0 5px 0 10px;
  background-color: white;
  border: none;
`

const SearchIcon = styled(SearchIconSVG)`
  width: 40px;
  height: 40px;
  float: right;
  color: ${COLORS.grayDarker}
`

export default SearchRegulations
