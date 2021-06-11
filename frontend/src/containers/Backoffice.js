import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import BaseMap from './BaseMap'
import LawType from '../components/backoffice/LawType'
import getAllRegulatoryZonesByRegTerritory from '../domain/use_cases/getAllRegulatoryZonesByRegTerritory'
import { setError } from '../domain/reducers/Global'
import { ReactComponent as SearchIconSVG } from '../components/icons/Loupe.svg'
//import showRegulatoryZoneMetadata from '../domain/use_cases/showRegulatoryZoneMetadata'
//import closeRegulatoryZoneMetadata from '../domain/use_cases/closeRegulatoryZoneMetadata'
//import zoomInSubZone from '../domain/use_cases/zoomInSubZone'
import { COLORS } from '../constants/constants'
import { BlackButton, WhiteButton } from '../components/commonStyles/Buttons.style'

const Backoffice = () => {
  const [searchText, setSearchText] = useState('')
  const [regulatoryZoneListByRegTerritory, setRegulatoryZoneListByRegTerritory] = useState(undefined)
  const dispatch = useDispatch()

  const searchRegulatoryZone = () => {
    console.log(`Search text is ${searchText}`)
  }

  const getRegulatoryZones = () => {
    dispatch(getAllRegulatoryZonesByRegTerritory(dispatch))
      .then(regulatoryZones => {
        setRegulatoryZoneListByRegTerritory(regulatoryZones)
      })
      .catch(error => {
        dispatch(setError(error))
      })
  }
  useEffect(() => {
    console.log('useEffect')
    getRegulatoryZones()
  }, [])

  const displayRegulatoryZoneListByLawType = (regZoneByLawType) => {
    return (
      regZoneByLawType && Object.keys(regZoneByLawType).length > 0
        ? Object.keys(regZoneByLawType).map(lawType => {
          return <LawType
            key={lawType}
            lawType={lawType}
            regZoneByLawType={regZoneByLawType} />
        })
        : <div>Aucune Law Type disponible</div>)
  }

  const displayRegulatoryZoneByRegTerritory = (territory) => {
    const franceRegList = regulatoryZoneListByRegTerritory[territory]
    return franceRegList
      ? <RegulatoryZoneListByLawTypeList>{displayRegulatoryZoneListByLawType(franceRegList)} </RegulatoryZoneListByLawTypeList>
      : <div>Aucune zone pour ce territoire</div>
  }

  function addNewRegZone () {
    console.log('addNewRegZone clicked')
  }

  function updateRegZone () {
    console.log('updateRegZone clicked')
  }

  return (
    <BackofficeContainer>
      <RegularotyZonePanel >
        <SearchContainer>
          <SearchBoxInput
            ref={input => input && input.focus()}
            type="text"
            value={searchText}
            placeholder={''}
            onChange={e => setSearchText(e.target.value)}/>
          <SearchButton
            onClick={() => searchRegulatoryZone()}
          >
            <SearchIcon />
          </SearchButton>
        </SearchContainer>
        <ButtonList>
          <WhiteButton>Brouillon (X)</WhiteButton>
          <WhiteButton>Tracé en attente (X)</WhiteButton>
        </ButtonList>
        {regulatoryZoneListByRegTerritory
          ? <SearchResultList>
            <Territory>
              <TerritoryName>{'Réglementation France'}</TerritoryName>
              {displayRegulatoryZoneByRegTerritory('France')}
            </Territory>
            <Territory>
              <TerritoryName>{'Réglementation UE'}</TerritoryName>
              {displayRegulatoryZoneByRegTerritory('UE')}
            </Territory>
          </SearchResultList>
          : <div>En attente de chargement</div>}
          <ButtonList>
            <BlackButton
              disabled={false}
              isLast={false}
              onClick={() => addNewRegZone()}>
              Saisir une nouvelle réglementation
            </BlackButton>
            <BlackButton
              disabled={true}
              isLast={true}
              onClick={() => updateRegZone()}>
              Modifier la réglementation
            </BlackButton>
        </ButtonList>
      </RegularotyZonePanel>
      <BaseMap />
    </BackofficeContainer>
  )
}

const SearchResultList = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  margin-top: 5px;
  color: ${COLORS.textWhite};
  text-decoration: none;
  border-radius: 2px;
  border-bottom: 1px solid ${COLORS.grayDarkerThree};
  height: calc(100vh - 300px);
`
// TODO Change 300

const Territory = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 1%;
  padding: 5px;
  box-sizing: border-box;
  width: 50%;
  overflow-y: auto;
`

const TerritoryName = styled.div`
  display: flex;
  font-size: 13px;
  text-transform: uppercase;
  color: ${COLORS.grayDarkerThree};
  color: ${COLORS.textGray};
  font-size: 16px;
`

const RegulatoryZoneListByLawTypeList = styled.div`
  margin: 10px 5px;
`

const SearchContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  justify-content: center;
  padding: 10px;
`

const ButtonList = styled.div`
  display: flex;
  flex-direction:row;
  justify-content: center;
  align-items: center;
  padding: 10px;
`

const BackofficeContainer = styled.div`
  display: flex;
  position: relative;
`

const RegularotyZonePanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  max-width: 50%;
  max-height: 100vh;
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

export default Backoffice
