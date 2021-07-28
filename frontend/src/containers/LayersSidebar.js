import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { setError } from '../domain/reducers/Global'

import { ReactComponent as LayersSVG } from '../components/icons/Couches.svg'
import LayersEnum, { layersType } from '../domain/entities/layers'
import getAllRegulatoryZones from '../domain/use_cases/getAllRegulatoryZones'
import RegulatoryZoneSelection from '../components/regulatory_zones/RegulatoryZoneSelection'
import AdministrativeZones from '../components/administratives_zones/AdministrativeZones'
import RegulatoryZoneSelected from '../components/regulatory_zones/RegulatoryZoneSelected'
import { COLORS } from '../constants/constants'
import closeRegulatoryZoneMetadata from '../domain/use_cases/closeRegulatoryZoneMetadata'
import RegulatoryZoneMetadata from '../components/regulatory_zones/RegulatoryZoneMetadata'
import BaseLayerSelection from '../components/base_layers/BaseLayerSelection'
import { MapComponentStyle } from '../components/commonStyles/MapComponent.style'
import NamespaceContext from '../domain/context/NamespaceContext'
import { MapButtonStyle } from '../components/commonStyles/MapButton.style'

const LayersSidebar = () => {
  const dispatch = useDispatch()
  const { regulatoryZoneMetadataPanelIsOpen } = useSelector(state => state.regulatory)
  const { healthcheckTextWarning } = useSelector(state => state.global)

  const firstUpdate = useRef(true)
  const [regulatoryZones, setRegulatoryZones] = useState()
  const [administrativeZones, setAdministrativeZones] = useState([])
  const [layersSidebarIsOpen, setLayersSidebarIsOpen] = useState(false)
  const [regulatoryZonesAddedToMySelection, setRegulatoryZonesAddedToMySelection] = useState(0)
  const [hideZonesListWhenSearching, setHideZonesListWhenSearching] = useState(false)

  useEffect(() => {
    if (layersSidebarIsOpen === true) {
      firstUpdate.current = false
    }

    if (!layersSidebarIsOpen) {
      dispatch(closeRegulatoryZoneMetadata())
    }
  }, [layersSidebarIsOpen])

  useEffect(() => {
    const administrativeZones = Object.keys(LayersEnum)
      .map(layerName => LayersEnum[layerName])
      .filter(layer => layer.type === layersType.ADMINISTRATIVE)
    setAdministrativeZones(administrativeZones)

    dispatch(getAllRegulatoryZones())
      .then(regulatoryZones => setRegulatoryZones(regulatoryZones))
      .catch(error => {
        dispatch(setError(error))
      })
  }, [])

  return (
    <NamespaceContext.Consumer>
      {
        namespace => (
          <>
          <SidebarLayersIcon
            title={'Couches réglementaires'}
            layersSidebarIsOpen={layersSidebarIsOpen}
            regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
            healthcheckTextWarning={healthcheckTextWarning}
            onClick={() => setLayersSidebarIsOpen(!layersSidebarIsOpen)}>
            <Layers/>
          </SidebarLayersIcon>
          <Sidebar
            healthcheckTextWarning={healthcheckTextWarning}
            layersSidebarIsOpen={layersSidebarIsOpen}
            firstUpdate={firstUpdate.current}>
            <RegulatoryZoneSelection
              regulatoryZones={regulatoryZones}
              regulatoryZonesAddedToMySelection={regulatoryZonesAddedToMySelection}
              setRegulatoryZonesAddedToMySelection={setRegulatoryZonesAddedToMySelection}
              layersSidebarIsOpen={layersSidebarIsOpen}
              setHideZonesListWhenSearching={setHideZonesListWhenSearching}
            />
            <Zones
              healthcheckTextWarning={healthcheckTextWarning}
            >
              <RegulatoryZoneSelected
                regulatoryZonesAddedToMySelection={regulatoryZonesAddedToMySelection}
                hideZonesListWhenSearching={hideZonesListWhenSearching}
                namespace={namespace}
              />
              <AdministrativeZones
                administrativeZones={administrativeZones}
                hideZonesListWhenSearching={hideZonesListWhenSearching}
                namespace={namespace}
              />
              <BaseLayerSelection namespace={namespace}/>
            </Zones>
            <MetadataWrapper
              healthcheckTextWarning={healthcheckTextWarning}
              firstUpdate={firstUpdate.current}
              regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
            >
              <RegulatoryZoneMetadata
                layersSidebarIsOpen={layersSidebarIsOpen}
              />
            </MetadataWrapper>
          </Sidebar>
          </>
        )
      }
    </NamespaceContext.Consumer>)
}

const Sidebar = styled(MapComponentStyle)`
  margin-left: ${props => props.layersSidebarIsOpen ? 0 : '-418px'};
  opacity: ${props => props.layersSidebarIsOpen ? 1 : 0};
  top: 10px;
  left: 57px;
  z-index: 999;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: 0.5s all;
`

const Zones = styled.div`
  margin-top: 5px;
  width: 350px;
  max-height: calc(100vh - ${props => props.healthcheckTextWarning ? '210px' : '160px'});
`

const SidebarLayersIcon = styled(MapButtonStyle)`
  position: absolute;
  display: inline-block;
  color: ${COLORS.blue};
  background: ${props => props.firstUpdate && !props.layersSidebarIsOpen ? COLORS.charcoal : props.layersSidebarIsOpen ? COLORS.shadowBlue : COLORS.charcoal};
  padding: 2px 2px 2px 2px;
  top: 10px;
  left: 12px;
  border-radius: 2px;
  height: 40px;
  width: 40px;

  :hover, :focus {
      background: ${props => props.firstUpdate && !props.layersSidebarIsOpen ? COLORS.charcoal : props.layersSidebarIsOpen ? COLORS.shadowBlue : COLORS.charcoal};
  }
`

const Layers = styled(LayersSVG)`
  width: 35px;
  height: 35px;
`

const MetadataWrapper = styled.div`
    border-radius: 2px;
    width: 380px;
    position: absolute;
    display: block;
    color: ${COLORS.charcoal};
    text-decoration: none;
    background-color: ${COLORS.gainsboro};
    padding: 0;
    margin-left: ${props => props.regulatoryZoneMetadataPanelIsOpen ? 361 : -30}px;
    margin-top: 45px;
    top: 0px;
    opacity: ${props => props.regulatoryZoneMetadataPanelIsOpen ? 1 : 0};
    z-index: -1;
    max-height: calc(100vh - ${props => props.healthcheckTextWarning ? '210px' : '160px'});
    padding: 10px 10px 0 10px;
    overflow-x: hidden;
    overflow-y: no-scroll;
    border-bottom: 10px solid #EEE;
    min-height: ${props => props.regulatoryZoneMetadataPanelIsOpen ? 400 : 100}px;
    transition: all 0.5s;
    
   
`

export default LayersSidebar
