// TODO Remove temporary `as any` and `@ts-ignore` (fresh migration to TS).

import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { THEME } from '@mtes-mct/monitor-ui'
import { BACKOFFICE_SEARCH_PROPERTIES } from 'domain/entities/backoffice'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { AddRegulationButton } from '../../../commonStyles/Buttons.style'
import SearchIconSVG from '../../../icons/Loupe.svg?react'
import { regulationActions } from '../../slice'
import { searchByLawType, searchResultIncludeZone } from '../../utils'

export function SearchRegulations({ regulatoryZoneListByRegTerritory, setFoundRegulatoryZonesByRegTerritory }) {
  const dispatch = useBackofficeAppDispatch()

  const searchInput = useRef<HTMLInputElement | null>(null)
  const [searchText, setSearchText] = useState('')

  const regulatoryZoneMetadata = useBackofficeAppSelector(state => state.regulation.regulatoryZoneMetadata)

  useEffect(() => {
    searchRegulatoryZone()

    function searchRegulatoryZone() {
      const searchResult = {}
      if (searchText === '') {
        setFoundRegulatoryZonesByRegTerritory(regulatoryZoneListByRegTerritory)
      } else {
        Object.keys(regulatoryZoneListByRegTerritory).forEach(territory => {
          const searchResultByLawType = (searchByLawType as any)(
            regulatoryZoneListByRegTerritory[territory],
            BACKOFFICE_SEARCH_PROPERTIES,
            searchText
          )
          if (searchResultByLawType && Object.keys(searchResultByLawType).length !== 0) {
            searchResult[territory] = searchResultByLawType
          }
        })
        if (regulatoryZoneMetadata) {
          if (!searchResultIncludeZone(searchResult, regulatoryZoneMetadata)) {
            dispatch(regulationActions.closeRegulatoryZoneMetadataPanel())
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
          data-cy="backoffice-search-regulation"
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
  background-color: white;
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 25px 40px 0;
`

const SearchBox = styled.div`
  align-items: center;
  border: 1px ${THEME.color.lightGray} solid;
  border-radius: 0;
  background-color: white;
  display: flex;
  flex-direction: row;
  margin-right: 10px;
  width: 100%;
`

const SearchBoxInput = styled.input`
  color: ${THEME.color.gunMetal};
  background-color: white;
  border: none;
  font-size: 13px;
  height: 40px;
  margin: 0;
  padding: 0 5px 0 10px;
  width: 100%;
`

const SearchIcon = styled(SearchIconSVG)`
  color: ${THEME.color.lightGray};
  float: right;
  height: 24px;
  margin-top: 2px;
  margin-right: 8px;
  width: 24px;
`
