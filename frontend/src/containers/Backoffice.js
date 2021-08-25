import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import BaseMap from './BaseMap'
import LawType from '../components/backoffice/LawType'
import SearchRegulations from '../components/backoffice/SearchRegulations'
import RegulatoryZoneMetadata from '../components/regulatory_zones/RegulatoryZoneMetadata'
import getAllRegulatoryZonesByRegTerritory from '../domain/use_cases/getAllRegulatoryZonesByRegTerritory'
import getAllGearCodes from '../domain/use_cases/getAllGearCodes'
import { COLORS } from '../constants/constants'
import { SecondaryButton } from '../components/commonStyles/Buttons.style'
import { EmptyResult } from '../components/commonStyles/Text.style'
import closeRegulatoryZoneMetadata from '../domain/use_cases/closeRegulatoryZoneMetadata'
import { RegulatoryTerritory } from '../domain/entities/regulatory'

const Backoffice = () => {
  const [foundRegulatoryZonesByRegTerritory, setFoundRegulatoryZonesByRegTerritory] = useState({})
  const showedLayers = useSelector(state => state.layer.showedLayers)
  const gears = useSelector(state => state.gear.gears)
  const dispatch = useDispatch()

  const {
    isReadyToShowRegulatoryZones,
    regulatoryZoneMetadataPanelIsOpen,
    loadingRegulatoryZoneMetadata,
    regulatoryZoneMetadata,
    layersNamesByRegTerritory
  } = useSelector(state => state.regulatory)

  useEffect(() => {
    dispatch(getAllRegulatoryZonesByRegTerritory())
    dispatch(getAllGearCodes())
  }, [])

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
        {Object.keys(RegulatoryTerritory).map((territory, id) => {
          const territoryNumber = Object.keys(RegulatoryTerritory).length
          return (
            <Territory key={territory} isLast={territoryNumber - 1 === id }>
              <TerritoryName >{RegulatoryTerritory[territory]}</TerritoryName>
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
          <SearchRegulations
            setFoundRegulatoryZonesByRegTerritory={setFoundRegulatoryZonesByRegTerritory}
            regulatoryZoneListByRegTerritory={layersNamesByRegTerritory}
          />
          <ButtonList>
            <SecondaryButton>Brouillon (X)</SecondaryButton>
            <SecondaryButton>Tracé en attente (X)</SecondaryButton>
            <SecondaryButton disabled>Dernière publications (X)</SecondaryButton>
          </ButtonList>
          {layersNamesByRegTerritory && layersNamesByRegTerritory !== {}
            ? displaySearchResultList()
            : <div>En attente de chargement</div>}
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
  max-height: calc(100vh - 138.5px - 25px);
  padding: 0 40px 25px;
  margin-bottom: 60px;
`

const Territory = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 1%;
  padding: 5px;
  box-sizing: border-box;
  max-width: 50%;
  margin-right: ${props => props.isLast ? '0px' : '20px'}
`

const TerritoryName = styled.div`
  display: flex;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  text-align: left;
  color: ${COLORS.grayDarkerTwo};
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
