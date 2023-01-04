import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { BACKOFFICE_SEARCH_PROPERTIES } from '../../../domain/entities/backoffice'
import { searchByLawType, searchResultIncludeZone } from '../../../domain/entities/regulation'
import { closeRegulatoryZoneMetadataPanel } from '../../../domain/shared_slices/Regulatory'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { AddRegulationButton } from '../../commonStyles/Buttons.style'
import { ReactComponent as SearchIconSVG } from '../../icons/Loupe.svg'

export function SearchRegulations(props) {
  const dispatch = useAppDispatch()
  const { regulatoryZoneListByRegTerritory, setFoundRegulatoryZonesByRegTerritory } = props

  const searchInput = useRef<HTMLInputElement>(null)
  const [searchText, setSearchText] = useState('')

  const { regulatoryZoneMetadata } = useAppSelector(state => state.regulatory)

  useEffect(() => {
    searchRegulatoryZone()

    function searchRegulatoryZone() {
      const searchResult = {}
      if (searchText === '') {
        setFoundRegulatoryZonesByRegTerritory(regulatoryZoneListByRegTerritory)
      } else {
        Object.keys(regulatoryZoneListByRegTerritory).forEach(territory => {
          const searchResultByLawType = searchByLawType(
            regulatoryZoneListByRegTerritory[territory],
            BACKOFFICE_SEARCH_PROPERTIES,
            searchText
          )
          if (searchResultByLawType && Object.keys(searchResultByLawType).length !== 0) {
            searchResult[territory] = searchResultByLawType
          }
        })
        if (regulatoryZoneMetadata !== null) {
          // TODO Properly type this `any`.
          if (!searchResultIncludeZone(searchResult, regulatoryZoneMetadata as any)) {
            dispatch(closeRegulatoryZoneMetadataPanel())
          }
        }
        setFoundRegulatoryZonesByRegTerritory(searchResult)
      }
    }
  }, [
    searchText,
    setFoundRegulatoryZonesByRegTerritory,
    regulatoryZoneListByRegTerritory,
    regulatoryZoneMetadata,
    dispatch
  ])

  useEffect(() => {
    if (searchInput.current) {
      searchInput.current.focus()
    }
  }, [])

  const navigate = useNavigate()

  const onAddRegulationClick = () => {
    navigate('/backoffice/regulation/new')
  }

  return (
    <SearchContainer>
      <SearchBox>
        <SearchBoxInput
          ref={searchInput}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Rechercher une zone par son nom ou sa référence réglementaire"
          type="text"
          value={searchText}
        />
        <SearchIcon />
      </SearchBox>
      <AddRegulationButton onClick={onAddRegulationClick} title="Saisir une nouvelle réglementation" />
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
  border: 1px ${p => p.theme.color.lightGray} solid;
  border-radius: 0;
  background-color: white;
  margin-right: 10px;
  width: 100%;
`

const SearchBoxInput = styled.input`
  margin: 0;
  color: ${p => p.theme.color.gunMetal};
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
  color: ${p => p.theme.color.lightGray};
`
