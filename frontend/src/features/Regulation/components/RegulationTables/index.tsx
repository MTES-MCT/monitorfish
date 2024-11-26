import { AdministrativeLayers } from '@features/AdministrativeZone/layers/AdministrativeLayers'
import { BaseLayer } from '@features/BaseMap/layers/BaseLayer'
import { backOfficeLayerActions } from '@features/BaseMap/slice.backoffice'
import { RegulatoryZoneMetadata } from '@features/Regulation/components/RegulatoryZoneMetadata'
import { RegulatoryLayers } from '@features/Regulation/layers/RegulatoryLayers'
import { RegulatoryPreviewLayer } from '@features/Regulation/layers/RegulatoryPreviewLayer'
import { regulationActions } from '@features/Regulation/slice'
import { getAllRegulatoryLayersByRegTerritory } from '@features/Regulation/useCases/getAllRegulatoryLayersByRegTerritory'
import { FRANCE, ORGP, UE, UK } from '@features/Regulation/utils'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { getAllGearCodes } from 'domain/use_cases/gearCode/getAllGearCodes'
import { getAllSpecies } from 'domain/use_cases/species/getAllSpecies'
import { isEmpty } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { LawType } from './LawType'
import { SearchRegulations } from './SearchRegulations'
import { EmptyResult } from '../../../commonStyles/Text.style'
import { BaseMap } from '../../../map/BaseMap'

import type { BackofficeAppThunk } from '@store'

export function RegulationTables() {
  const [foundRegulatoryZonesByRegTerritory, setFoundRegulatoryZonesByRegTerritory] = useState({})
  const dispatch = useBackofficeAppDispatch()
  const [mapMovingAndZoomEvent, setMapMovingAndZoomEvent] = useState<{
    dummyUpdate: boolean
  } | null>(null)

  const handleMovingAndZoom = () => {
    setMapMovingAndZoomEvent({ dummyUpdate: true })
  }

  const lastShowedFeatures = useBackofficeAppSelector(state => state.layer.lastShowedFeatures)
  const layersToFeatures = useBackofficeAppSelector(state => state.layer.layersToFeatures)
  const layersTopicsByRegTerritory = useBackofficeAppSelector(state => state.regulation.layersTopicsByRegTerritory)
  const regulatoryZoneMetadataPanelIsOpen = useBackofficeAppSelector(
    state => state.regulation.regulatoryZoneMetadataPanelIsOpen
  )
  const regulatoryZonesToPreview = useBackofficeAppSelector(state => state.regulation.regulatoryZonesToPreview)
  // TODO Scritly type this once the store is perfectly typed.
  const regulationSaved = useBackofficeAppSelector(state => state.regulation.regulationSaved)
  const regulatoryZoneMetadata = useBackofficeAppSelector(state => state.regulation.regulatoryZoneMetadata)
  const showedLayers = useBackofficeAppSelector(state => state.layer.showedLayers)
  const simplifiedGeometries = useBackofficeAppSelector(state => state.regulation.simplifiedGeometries)

  const initBackoffice = useCallback(async () => {
    await dispatch(getAllSpecies<BackofficeAppThunk>())
    dispatch(getAllRegulatoryLayersByRegTerritory())
    dispatch(getAllGearCodes<BackofficeAppThunk>())
    dispatch(regulationActions.setProcessingRegulationSaved(false))
    dispatch(regulationActions.setRegulatoryZoneMetadata(undefined))
  }, [dispatch])

  /**
   * Init component datas on first load
   */
  useEffect(() => {
    initBackoffice()

    return () => {
      dispatch(backOfficeLayerActions.resetShowedLayer())
    }
  }, [dispatch, initBackoffice])

  /**
   * Refresh components data when a regulation is updated
   */
  useEffect(() => {
    if (regulationSaved) {
      initBackoffice()
    }
  }, [initBackoffice, regulationSaved])

  const displayRegulatoryZoneListByLawType = useCallback(
    (territory, regZoneByLawType) =>
      regZoneByLawType && Object.keys(regZoneByLawType).sort().length > 0 ? (
        Object.keys(regZoneByLawType).map(lawType => (
          <LawType
            key={lawType}
            isEditable
            lawType={lawType}
            regZoneByLawType={regZoneByLawType}
            territory={territory}
          />
        ))
      ) : (
        <EmptyResult>Aucun résultat</EmptyResult>
      ),
    []
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
    [displayRegulatoryZoneListByLawType, foundRegulatoryZonesByRegTerritory]
  )

  const searchResultList = useMemo(
    () => (
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
    ),
    [displayRegulatoryZoneByRegTerritory]
  )

  return (
    <>
      <BackofficeContainer>
        <RegulatoryZonePanel>
          <SearchRegulations
            regulatoryZoneListByRegTerritory={layersTopicsByRegTerritory}
            setFoundRegulatoryZonesByRegTerritory={setFoundRegulatoryZonesByRegTerritory}
          />
          {layersTopicsByRegTerritory && !isEmpty(layersTopicsByRegTerritory) ? (
            searchResultList
          ) : (
            <div>En attente de chargement</div>
          )}
        </RegulatoryZonePanel>
        <BaseMap handleMovingAndZoom={handleMovingAndZoom}>
          <BaseLayer />
          <RegulatoryLayers
            dispatch={dispatch}
            lastShowedFeatures={lastShowedFeatures}
            layersToFeatures={layersToFeatures}
            mapMovingAndZoomEvent={mapMovingAndZoomEvent}
            regulatoryZoneMetadata={regulatoryZoneMetadata}
            showedLayers={showedLayers}
            simplifiedGeometries={simplifiedGeometries}
          />
          <AdministrativeLayers />
          <RegulatoryPreviewLayer dispatch={dispatch} regulatoryZonesToPreview={regulatoryZonesToPreview} />
        </BaseMap>
      </BackofficeContainer>
      {/* TODO Is it always `false`? */}
      {regulatoryZoneMetadataPanelIsOpen && (
        <MetadataWrapper regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}>
          <RegulatoryZoneMetadata />
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

const Territory = styled.div<{
  isLast?: boolean
}>`
  display: flex;
  flex-direction: column;
  flex: 1 1 1%;
  padding: 5px;
  box-sizing: border-box;
  max-width: 50%;
  min-width: 250px;
  margin-right: ${p => (p.isLast ? '0px' : '20px')};
`

const TerritoryName = styled.div`
  display: flex;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  text-align: left;
  color: ${p => p.theme.color.slateGray};
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
  background-color: ${p => p.theme.color.white};
  width: 100%;
  height: 100vh;
`

const RegulatoryZonePanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  max-height: 100vh;
  max-width: 50%;
  background-color: ${p => p.theme.color.white};
`

const MetadataWrapper = styled.div<{
  regulatoryZoneMetadataPanelIsOpen: boolean
}>`
  display: ${props => (props.regulatoryZoneMetadataPanelIsOpen ? 'flex' : 'none')};
  position: absolute;
  top: 0;
  left: calc(50% + 88px);
  z-index: 1;
  color: ${p => p.theme.color.gunMetal};
  margin: 6px 0 0 6px;
  flex-direction: column;
  max-height: 95vh;
  transition: all 0.5s;
  opacity: ${props => (props.regulatoryZoneMetadataPanelIsOpen ? '1' : '0')};
  background: linear-gradient(${p => p.theme.color.gainsboro} 70%, rgb(0, 0, 0, 0));
`
