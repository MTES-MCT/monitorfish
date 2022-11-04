import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import BaseMap from '../map/BaseMap'
import LawType from './list_regulation/LawType'
import SearchRegulations from './list_regulation/SearchRegulations'
import RegulatoryZoneMetadata from '../layers/regulatory/RegulatoryZoneMetadata'
import BaseLayer from '../../layers/BaseLayer'
import RegulatoryLayers from '../../layers/RegulatoryLayers'
import AdministrativeLayers from '../../layers/AdministrativeLayers'
import RegulatoryPreviewLayer from '../../layers/RegulatoryPreviewLayer'
import ShowRegulatoryMetadata from '../map/ShowRegulatoryMetadata'

import getAllRegulatoryLayersByRegTerritory from '../../domain/use_cases/layer/regulation/getAllRegulatoryLayers'
import getAllGearCodes from '../../domain/use_cases/gearCode/getAllGearCodes'
import { closeRegulatoryZoneMetadata } from '../../domain/use_cases/layer/regulation/closeRegulatoryZoneMetadata'
import { FRANCE, ORGP, UE, UK } from '../../domain/entities/regulatory'
import { COLORS } from '../../constants/constants'
import { EmptyResult } from '../commonStyles/Text.style'
import { setProcessingRegulationSaved } from './Regulation.slice'
import { setRegulatoryZoneMetadata } from '../../domain/shared_slices/Regulatory'
import layer from '../../domain/shared_slices/Layer'
import getAllSpecies from '../../domain/use_cases/species/getAllSpecies'

const Backoffice = () => {
  const [foundRegulatoryZonesByRegTerritory, setFoundRegulatoryZonesByRegTerritory] = useState({})
  const gears = useSelector(state => state.gear.gears)
  const dispatch = useDispatch()
  const [mapMovingAndZoomEvent, setMapMovingAndZoomEvent] = useState(null)
  const { resetShowedLayer } = layer.backoffice.actions

  const handleMovingAndZoom = () => {
    setMapMovingAndZoomEvent({ dummyUpdate: true })
  }

  const {
    regulatoryZoneMetadataPanelIsOpen,
    loadingRegulatoryZoneMetadata,
    regulatoryZoneMetadata,
    layersTopicsByRegTerritory
  } = useSelector(state => state.regulatory)

  const { regulationSaved } = useSelector(state => state.regulation)

  const initBackoffice = () => {
    batch(async () => {
      await dispatch(getAllSpecies())
      dispatch(getAllRegulatoryLayersByRegTerritory())
      dispatch(getAllGearCodes())
      dispatch(setProcessingRegulationSaved(false))
      dispatch(setRegulatoryZoneMetadata(null))
    })
  }

  /**
   * Init component datas on first load
   */
  useEffect(() => {
    initBackoffice()
    return () => {
      dispatch(resetShowedLayer('backoffice'))
    }
  }, [])

  /**
   * Refresh components data when a regulation is updated
   */
  useEffect(() => {
    if (regulationSaved) {
      initBackoffice()
    }
  }, [regulationSaved])

  const callCloseRegulatoryZoneMetadata = useCallback(() => {
    dispatch(closeRegulatoryZoneMetadata())
  }, [])

  const displayRegulatoryZoneListByLawType = useCallback(
    (territory, regZoneByLawType) => {
      return regZoneByLawType && Object.keys(regZoneByLawType).sort().length > 0 ? (
        Object.keys(regZoneByLawType).map(lawType => {
          return (
            <LawType
              key={lawType}
              lawType={lawType}
              regZoneByLawType={regZoneByLawType}
              isEditable={true}
              territory={territory}
            />
          )
        })
      ) : (
        <EmptyResult>Aucun résultat</EmptyResult>
      )
    },
    [foundRegulatoryZonesByRegTerritory]
  )

  const displayRegulatoryZoneByRegTerritory = useCallback(
    territory => {
      const territoryRegList = foundRegulatoryZonesByRegTerritory[territory]
      return territoryRegList ? (
        <RegulatoryZoneListByLawTypeList>
          {displayRegulatoryZoneListByLawType(territory, territoryRegList)}
        </RegulatoryZoneListByLawTypeList>
      ) : (
        <EmptyResult>Aucune zone pour ce territoire</EmptyResult>
      )
    },
    [foundRegulatoryZonesByRegTerritory]
  )

  const searchResultList = useMemo(() => {
    return (
      <SearchResultList>
        <Columns>
          <Territory key={FRANCE}>
            <TerritoryName>{FRANCE}</TerritoryName>
            {displayRegulatoryZoneByRegTerritory(FRANCE)}
          </Territory>
          <Territory key={UE}>
            <TerritoryName>{UE}</TerritoryName>
            {displayRegulatoryZoneByRegTerritory(UE)}
          </Territory>
        </Columns>
        <Columns>
          <Territory key={UK}>
            <TerritoryName>{UK}</TerritoryName>
            {displayRegulatoryZoneByRegTerritory(UK)}
          </Territory>
          <Territory key={ORGP}>
            <TerritoryName>{ORGP}</TerritoryName>
            {displayRegulatoryZoneByRegTerritory(ORGP)}
          </Territory>
        </Columns>
      </SearchResultList>
    )
  }, [foundRegulatoryZonesByRegTerritory])

  return (
    <>
      <BackofficeContainer>
        <RegulatoryZonePanel regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}>
          <SearchRegulations
            setFoundRegulatoryZonesByRegTerritory={setFoundRegulatoryZonesByRegTerritory}
            regulatoryZoneListByRegTerritory={layersTopicsByRegTerritory}
          />
          {layersTopicsByRegTerritory && layersTopicsByRegTerritory !== {} ? (
            searchResultList
          ) : (
            <div>En attente de chargement</div>
          )}
        </RegulatoryZonePanel>
        <BaseMap handleMovingAndZoom={handleMovingAndZoom}>
          <BaseLayer />
          <RegulatoryLayers mapMovingAndZoomEvent={mapMovingAndZoomEvent} />
          <AdministrativeLayers />
          <ShowRegulatoryMetadata hasClickEvent />
          <RegulatoryPreviewLayer />
        </BaseMap>
      </BackofficeContainer>
      {regulatoryZoneMetadataPanelIsOpen && (
        <MetadataWrapper regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}>
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
      )}
    </>
  )
}

const Columns = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  flex: 1;
  max-height: calc(100vh - 138.5px - 25px - 100px);
`

const SearchResultList = styled.div`
  margin-top: 25px;
  color: ${p => p.theme.color.gainsboro};
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
  min-width: 250px;
  margin-right: ${props => (props.isLast ? '0px' : '20px')};
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
  display: ${props => (props.regulatoryZoneMetadataPanelIsOpen ? 'flex' : 'none')};
  position: absolute;
  top: 0;
  left: calc(50% + 72px);
  z-index: 1;
  color: ${COLORS.gunMetal};
  margin: 6px 0 0 6px;
  flex-direction: column;
  max-height: 95vh;
  transition: all 0.5s;
  opacity: ${props => (props.regulatoryZoneMetadataPanelIsOpen ? '1' : '0')};
  background: linear-gradient(${COLORS.gainsboro} 70%, rgb(0, 0, 0, 0));
`

export default Backoffice
