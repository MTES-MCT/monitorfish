import React, { useEffect, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import BaseMap from '../map/BaseMap'
import LawType from './LawType'
import SearchRegulations from './SearchRegulations'
import RegulatoryLayerZoneMetadata from '../layers/regulatory/RegulatoryLayerZoneMetadata'
import getAllRegulatoryLayersByRegTerritory from '../../domain/use_cases/getAllRegulatoryLayersByRegTerritory'
import getAllGearCodes from '../../domain/use_cases/getAllGearCodes'
import { COLORS } from '../../constants/constants'
import { EmptyResult } from '../commonStyles/Text.style'
import closeRegulatoryZoneMetadata from '../../domain/use_cases/closeRegulatoryZoneMetadata'
import { REGULATORY_TERRITORY } from '../../domain/entities/regulatory'
/* import { SecondaryButton } from '../commonStyles/Buttons.style' */

const Backoffice = () => {
  const [foundRegulatoryZonesByRegTerritory, setFoundRegulatoryZonesByRegTerritory] = useState({})
  const showedLayers = useSelector(state => state.layer.showedLayers)
  const gears = useSelector(state => state.gear.gears)
  const dispatch = useDispatch()

  const {
    regulatoryZoneMetadataPanelIsOpen,
    loadingRegulatoryZoneMetadata,
    regulatoryZoneMetadata,
    layersTopicsByRegTerritory
  } = useSelector(state => state.regulatory)

  const { regulationSaved } = useSelector(state => state.regulation)

  const initBackoffice = () => {
    batch(() => {
      dispatch(getAllRegulatoryLayersByRegTerritory())
      dispatch(getAllGearCodes())
    })
  }

  /**
   * Init component datas on first load
   */
  useEffect(() => {
    initBackoffice()
  }, [])

  /**
   * Refresh components data when a regulation is updated
   */
  useEffect(() => {
    if (regulationSaved) {
      initBackoffice()
    }
  }, [regulationSaved])

  function callCloseRegulatoryZoneMetadata () {
    dispatch(closeRegulatoryZoneMetadata())
  }

  const displayRegulatoryZoneListByLawType = (territory, regZoneByLawType) => {
    return (regZoneByLawType && Object.keys(regZoneByLawType)
      .sort()
      .length > 0
      ? Object.keys(regZoneByLawType).map(lawType => {
        return <LawType
          key={lawType}
          lawType={lawType}
          regZoneByLawType={regZoneByLawType}
          showedLayers={showedLayers}
          gears={gears}
          callCloseRegulatoryZoneMetadata={callCloseRegulatoryZoneMetadata}
          isEditable={true}
          territory={territory}
        />
      })
      : <EmptyResult>Aucun résultat</EmptyResult>)
  }

  const displayRegulatoryZoneByRegTerritory = (territory) => {
    const territoryRegList = foundRegulatoryZonesByRegTerritory[territory]
    return territoryRegList
      ? <RegulatoryZoneListByLawTypeList>{displayRegulatoryZoneListByLawType(territory, territoryRegList)}</RegulatoryZoneListByLawTypeList>
      : <EmptyResult>Aucune zone pour ce territoire</EmptyResult>
  }

  const displaySearchResultList = () => {
    const territoryList = Object.keys(REGULATORY_TERRITORY)
    return (
      <SearchResultList>
        {territoryList.map((territory, id) => {
          return <Territory key={territory} isLast={territoryList.length - 1 === id }>
              <TerritoryName >{territory}</TerritoryName>
              {displayRegulatoryZoneByRegTerritory(territory)}
            </Territory>
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
            regulatoryZoneListByRegTerritory={layersTopicsByRegTerritory}
          />
          {/* <ButtonList>
            <SecondaryButton>Brouillon (X)</SecondaryButton>
            <SecondaryButton>Tracé en attente (X)</SecondaryButton>
            <SecondaryButton disabled>Dernière publications (X)</SecondaryButton>
          </ButtonList> */}
          {layersTopicsByRegTerritory && layersTopicsByRegTerritory !== {}
            ? displaySearchResultList()
            : <div>En attente de chargement</div>}
        </RegulatoryZonePanel>
        <BaseMap/>
      </BackofficeContainer>
      <MetadataWrapper
        regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
      >
        <RegulatoryLayerZoneMetadata
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
  color: ${COLORS.slateGray};
`

const RegulatoryZoneListByLawTypeList = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 10px 0;
`

/* const ButtonList = styled.div`
  display: flex;
  flex-direction:row;
  justify-content: flex-start;
  align-items: center;
  padding: 0 40px 0 30px;
` */

const BackofficeContainer = styled.div`
  display: flex;
  position: relative;
  background-color: ${COLORS.white};
  width: 100%;
  height: 100vh;
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
  left: calc(50% + 72px);
  z-index: 1;
  color: ${COLORS.gunMetal};
  margin: 6px 0 0 6px;
  flex-direction: column;
  max-height: 95vh;
  transition: all 0.5s;
  opacity: ${props => props.regulatoryZoneMetadataPanelIsOpen ? '1' : '0'};
  background: ${COLORS.gainsboro};
`

export default Backoffice
