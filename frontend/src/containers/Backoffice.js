import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import BaseMap from './BaseMap'
import LawType from '../components/backoffice/LawType'
import SearchComponent from '../components/backoffice/SearchComponent'
import RegulatoryZoneMetadata from '../components/regulatory_zones/RegulatoryZoneMetadata'
import getAllRegulatoryZonesByRegTerritory from '../domain/use_cases/getAllRegulatoryZonesByRegTerritory'
import getAllGearCodes from '../domain/use_cases/getAllGearCodes'
import { setError } from '../domain/reducers/Global'
import { COLORS } from '../constants/constants'
import { BlackButton, WhiteButton } from '../components/commonStyles/Buttons.style'
import { EmptyResult } from '../components/commonStyles/Text.style'
import closeRegulatoryZoneMetadata from '../domain/use_cases/closeRegulatoryZoneMetadata'
import { RegulatoryTerritory } from '../domain/entities/regulatory'

const Backoffice = () => {
  const [foundRegulatoryZonesByRegTerritory, setFoundRegulatoryZonesByRegTerritory] = useState({})
  const [regulatoryZoneListByRegTerritory, setRegulatoryZoneListByRegTerritory] = useState({})
  const showedLayers = useSelector(state => state.layer.showedLayers)
  const gears = useSelector(state => state.gear.gears)
  const dispatch = useDispatch()

  const {
    isReadyToShowRegulatoryZones,
    regulatoryZoneMetadataPanelIsOpen,
    loadingRegulatoryZoneMetadata,
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)

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
    getRegulatoryZones()
    dispatch(getAllGearCodes())
  }, [])

  function addNewRegZone () {
    console.log('addNewRegZone clicked')
  }

  function callCloseRegulatoryZoneMetadata () {
    dispatch(closeRegulatoryZoneMetadata())
  }

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
        : <EmptyResult>Aucun résultat</EmptyResult>)
  }

  const displayRegulatoryZoneByRegTerritory = (territory) => {
    const territoryRegList = foundRegulatoryZonesByRegTerritory[territory]
    return territoryRegList
      ? <RegulatoryZoneListByLawTypeList>{displayRegulatoryZoneListByLawType(territoryRegList)}</RegulatoryZoneListByLawTypeList>
      : <EmptyResult>Aucune zone pour ce territoire</EmptyResult>
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
    <>
      <BackofficeContainer>
        <RegulatoryZonePanel
          regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
        >
          <SearchComponent
            setFoundRegulatoryZonesByRegTerritory={setFoundRegulatoryZonesByRegTerritory}
            regulatoryZoneListByRegTerritory={regulatoryZoneListByRegTerritory}
          />
          <ButtonList>
            <WhiteButton>Brouillon (X)</WhiteButton>
            <WhiteButton>Tracé en attente (X)</WhiteButton>
            <WhiteButton disabled>Dernière publications (X)</WhiteButton>
          </ButtonList>
          {regulatoryZoneListByRegTerritory
            ? displaySearchResultList()
            : <div>En attente de chargement</div>}
          <ButtonListFooter>
            <BlackButton
              disabled={false}
              isLast={false}
              onClick={() => addNewRegZone()}>
              Saisir une nouvelle réglementation
            </BlackButton>
          </ButtonListFooter>
        </RegulatoryZonePanel>
        <BaseMap/>
      </BackofficeContainer>
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
    </>
  )
}

const SearchResultList = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  flex: 1;
  margin-top: 5px;
  color: ${COLORS.textWhite};
  text-decoration: none;
  border-radius: 2px;
  border-bottom: 1px solid ${COLORS.grayDarker};
  height: calc(100vh - 300px);
  padding: 0 40px;
`

const Territory = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 1%;
  padding: 5px;
  box-sizing: border-box;
  width: 50%;
`

const TerritoryName = styled.div`
  display: flex;
  font-size: 16px;
  text-transform: uppercase;
  text-align: left;
  color: ${COLORS.grayDarkerTwo};
  font-weight: 600;
`

const RegulatoryZoneListByLawTypeList = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 10px 0;
`

const ButtonList = styled.div`
  display: flex;
  flex-direction:row;
  justify-content: flex-start;
  align-items: center;
  padding: 0 40px 0 30px;
`

const ButtonListFooter = styled.div`
  ${ButtonList};
  justify-content: center;
`

const BackofficeContainer = styled.div`
  display: flex;
  position: relative;
  background-color: ${COLORS.white}:
`

const RegulatoryZonePanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  max-height: 100vh;
  max-width: 50%;
  background-color: ${COLORS.white};
`

const MetadataWrapper = styled.div`
  display: ${props => props.regulatoryZoneMetadataPanelIsOpen ? 'flex' : 'none'};
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 1;
  width: 380px;
  border-radius: 2px;
  color: #515151;
  text-decoration: none;
  background-color: #EEEEEE;
  padding: 10px;
  margin: 6px 0 0 6px;
  flex-direction: column;
  max-height: 95vh;
  transition: all 0.5s;
  opacity: ${props => props.regulatoryZoneMetadataPanelIsOpen ? '1' : '0'};
`

export default Backoffice
