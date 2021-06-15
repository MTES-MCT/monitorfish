import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import BaseMap from './BaseMap'
import LawType from '../components/backoffice/LawType'
import RegulatoryZoneMetadata from '../components/regulatory_zones/RegulatoryZoneMetadata'
import getAllRegulatoryZonesByRegTerritory from '../domain/use_cases/getAllRegulatoryZonesByRegTerritory'
import getAllGearCodes from '../domain/use_cases/getAllGearCodes'
import { setError } from '../domain/reducers/Global'
import { ReactComponent as SearchIconSVG } from '../components/icons/Loupe.svg'
import { COLORS } from '../constants/constants'
import { BlackButton, WhiteButton } from '../components/commonStyles/Buttons.style'
import closeRegulatoryZoneMetadata from '../domain/use_cases/closeRegulatoryZoneMetadata'
import { RegulatoryTerritory } from '../domain/entities/regulatory'

const Backoffice = () => {
  const [searchText, setSearchText] = useState('')
  const [regulatoryZoneListByRegTerritory, setRegulatoryZoneListByRegTerritory] = useState(undefined)
  const showedLayers = useSelector(state => state.layer.showedLayers)
  const gears = useSelector(state => state.gear.gears)
  const dispatch = useDispatch()

  const {
    isReadyToShowRegulatoryZones,
    regulatoryZoneMetadataPanelIsOpen,
    loadingRegulatoryZoneMetadata,
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)

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
    dispatch(getAllGearCodes())
  }, [])

  useEffect(() => {
    console.log(gears)
  }, [gears])

  const displayRegulatoryZoneListByLawType = (regZoneByLawType) => {
    return (
      regZoneByLawType && Object.keys(regZoneByLawType).length > 0
        ? Object.keys(regZoneByLawType).map(lawType => {
          return <LawType
            key={lawType}
            lawType={lawType}
            regZoneByLawType={regZoneByLawType}
            showedLayers={showedLayers}
            gears={gears}
            isReadyToShowRegulatoryZones={isReadyToShowRegulatoryZones}
            callCloseRegulatoryZoneMetadata={callCloseRegulatoryZoneMetadata}
          />
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

  function callCloseRegulatoryZoneMetadata () {
    dispatch(closeRegulatoryZoneMetadata())
  }

  const displaySearchResultList = () => {
    return (
    <SearchResultList>
      {Object.keys(RegulatoryTerritory).map(territory => {
        return (
          <Territory key={territory}>
            <TerritoryName>{RegulatoryTerritory[territory]}</TerritoryName>
            {displayRegulatoryZoneByRegTerritory(territory)}
          </Territory>
        )
      })}
    </SearchResultList>)
  }

  return (
    <BackofficeContainer>
      <RegulatoryZonePanel
        regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
      >
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
          ? displaySearchResultList()
          : <div>En attente de chargement</div>}
          <ButtonList>
            <BlackButton
              disabled={false}
              isLast={false}
              onClick={() => addNewRegZone()}>
              Saisir une nouvelle réglementation
            </BlackButton>
        </ButtonList>
      </RegulatoryZonePanel>
      <MetadataWrapper
        regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
      >
        <RegulatoryZoneMetadata
          loadingRegulatoryZoneMetadata={loadingRegulatoryZoneMetadata}
          regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
          regulatoryZoneMetadata={regulatoryZoneMetadata}
          callCloseRegulatoryZoneMetadata={callCloseRegulatoryZoneMetadata}
          gears={gears}
          layersSidebarIsOpen={true}
          fromBackoffice={true}
        />
      </MetadataWrapper>
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

const RegulatoryZonePanel = styled.div`
  display: flex;
  flex: ${props => props.regulatoryZoneMetadataPanelIsOpen ? 2 : 1};
  flex-direction: column;
  max-height: 100vh;
  max-width: 50%;
`

const MetadataWrapper = styled.div`
  display: ${props => props.regulatoryZoneMetadataPanelIsOpen ? 'flex' : 'none'};
  flex: 1;
  border-radius: 2px;
  color: #515151;
  text-decoration: none;
  background-color: #EEEEEE;
  padding: 0;
  padding: 10px;
  flex-direction: column;
  height: 100vh;
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
