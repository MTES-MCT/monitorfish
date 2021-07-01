import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as SearchIconSVG } from '../icons/Loupe.svg'
import { search } from '../../utils'
import { COLORS } from '../../constants/constants'

const SearchComponent = props => {
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

  const properties = ['layerName', 'zone', 'region', 'seafront', 'regulatoryReferences']

  const searchRegulatoryZone = () => {
    const searchResult = {}
    if (searchText === '') {
      setFoundRegulatoryZonesByRegTerritory(regulatoryZoneListByRegTerritory)
    } else {
      Object.keys(regulatoryZoneListByRegTerritory).forEach(territory => {
        const searchResultByLawType = {}
        Object.keys(regulatoryZoneListByRegTerritory[territory]).forEach(lawType => {
          const regulatoryZone = Object.assign({}, regulatoryZoneListByRegTerritory[territory][lawType])
          const foundRegulatoryZones = search(searchText, properties, regulatoryZone)
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

  return (
    <SearchContainer>
      <SearchBoxInput
        ref={searchInput}
        type="text"
        value={searchText}
        placeholder={'Rechercher une zone par son nom ou sa référence réglementaire'}
        onChange={e => setSearchText(e.target.value)}/>
      <SearchButton
        onClick={searchRegulatoryZone}
      >
        <SearchIcon/>
      </SearchButton>
    </SearchContainer>
  )
}

const SearchContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  justify-content: center;
  padding: 25px 40px 0;
`

const SearchBoxInput = styled.input`
  margin: 0;
  background-color: white;
  border: 1px ${COLORS.gray} solid;
  border-radius: 0;
  color: ${COLORS.grayDarkerThree};
  font-size: 0.8em;
  height: 40px;
  width: 100%;
  padding: 0 5px 0 10px;
`

const SearchIcon = styled(SearchIconSVG)`
  width: 40px;
  height: 40px;
  float: right;
  background: ${COLORS.grayDarkerThree};
  cursor: pointer;
`

const SearchButton = styled.a`
  width: 40px;
  height: 40px;
`

export default SearchComponent
