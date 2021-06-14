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

const LayersSidebar = () => {
  const dispatch = useDispatch()
  const {
    regulatoryZoneMetadataPanelIsOpen,
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)
  const temporaryVesselsToHighLightOnMap = useSelector(state => state.vessel.temporaryVesselsToHighLightOnMap)

  const firstUpdate = useRef(true)
  const [regulatoryZones, setRegulatoryZones] = useState()
  const [administrativeZones, setAdministrativeZones] = useState([])
  const [layersSidebarIsOpen, setLayersSidebarIsOpen] = useState(false)
  const [regulatoryZonesAddedToMySelection, setRegulatoryZonesAddedToMySelection] = useState(0)
  const [hideZonesListWhenSearching, setHideZonesListWhenSearching] = useState(false)
  const [isShowed, setIsShowed] = useState(true)

  useEffect(() => {
    if (temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length) {
      setIsShowed(false)
    } else {
      setIsShowed(true)
    }
  }, [temporaryVesselsToHighLightOnMap])

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

    dispatch(getAllRegulatoryZones(dispatch))
      .then(regulatoryZones => {
        console.log(regulatoryZones)
        setRegulatoryZones(regulatoryZones)
      })
      .catch(error => {
        dispatch(setError(error))
      })
  }, [])

  return (
        <Sidebar
            isShowed={isShowed}
            layersSidebarIsOpen={layersSidebarIsOpen}
            firstUpdate={firstUpdate.current}>
            <SidebarLayersIcon
                title={'Couches réglementaires'}
                layersSidebarIsOpen={layersSidebarIsOpen}
                regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
                onClick={() => setLayersSidebarIsOpen(!layersSidebarIsOpen)}>
                <Layers/>
            </SidebarLayersIcon>
            <RegulatoryZoneSelection
                regulatoryZones={regulatoryZones}
                regulatoryZonesAddedToMySelection={regulatoryZonesAddedToMySelection}
                setRegulatoryZonesAddedToMySelection={setRegulatoryZonesAddedToMySelection}
                layersSidebarIsOpen={layersSidebarIsOpen}
                setHideZonesListWhenSearching={setHideZonesListWhenSearching}
            />
            <Zones>
                <RegulatoryZoneSelected
                    regulatoryZonesAddedToMySelection={regulatoryZonesAddedToMySelection}
                    hideZonesListWhenSearching={hideZonesListWhenSearching}
                />
                <AdministrativeZones
                    administrativeZones={administrativeZones}
                    hideZonesListWhenSearching={hideZonesListWhenSearching}
                />
                <BaseLayerSelection />
            </Zones>
          <MetadataWrapper
            firstUpdate={firstUpdate.current}
            regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
            regulatoryZoneMetadata={regulatoryZoneMetadata}
            layersSidebarIsOpen={layersSidebarIsOpen}
          >
            <RegulatoryZoneMetadata
              layersSidebarIsOpen={layersSidebarIsOpen}
            />
          </MetadataWrapper>
        </Sidebar>
  )
}

const Sidebar = styled.div`
  margin-left: -373px;
  top: 10px;
  left: 12px;
  z-index: 999;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  animation: ${props => props.firstUpdate && !props.layersSidebarIsOpen ? '' : props.layersSidebarIsOpen ? 'left-sidebar-opening' : 'left-sidebar-closing'} 0.5s ease forwards,
  ${props => props.isShowed ? 'left-sidebar-visible' : 'left-sidebar-hiding'} 0.5s ease forwards;

  @keyframes left-sidebar-visible {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes left-sidebar-hiding {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes left-sidebar-opening {
    0%   { margin-left: -373px;   }
    100% { margin-left: 0; }
  }

  @keyframes left-sidebar-closing {
    0% { margin-left: 0; }
    100%   { margin-left: -373px;   }
  }
`

const Zones = styled.div`
  margin-top: 5px;
  width: 335px;
  color: ${COLORS.textWhite};
  text-decoration: none;
  background-color: ${COLORS.gray};
  padding: 1px 10px 10px 10px;
  max-height: calc(100vh - 50px);
  border-radius: 2px;
`

const SidebarLayersIcon = styled.button`
  position: absolute;
  display: inline-block;
  color: #05055E;
  background: ${props => props.firstUpdate && !props.layersSidebarIsOpen ? COLORS.grayDarkerThree : props.layersSidebarIsOpen ? COLORS.grayDarkerTwo : COLORS.grayDarkerThree};
  padding: 2px 2px 2px 2px;
  margin-top: 0;
  margin-left: ${props => props.firstUpdate && !props.layersSidebarIsOpen ? '190px' : props.layersSidebarIsOpen ? '187px' : '190px'};
  border-radius: 2px;
  height: 40px;
  width: 40px;

  :hover, :focus {
      background: ${props => props.firstUpdate && !props.layersSidebarIsOpen ? COLORS.grayDarkerThree : props.layersSidebarIsOpen ? COLORS.grayDarkerTwo : COLORS.grayDarkerThree};
  }
`

const Layers = styled(LayersSVG)`
  width: 35px;
  height: 35px;
`

const MetadataWrapper = styled.div`
    border-radius: 2px;
    width: 350px;
    position: absolute;
    display: block;
    color: ${COLORS.grayDarkerThree};
    text-decoration: none;
    background-color: ${COLORS.gray};
    padding: 0;
    margin-left: -30px;
    margin-top: 45px;
    top: 0px;
    opacity: 0;
    z-index: -1;
    min-height: 100px;
    max-height: calc(100vh - 50px);
    padding: 10px;
    
    animation: ${props => (props.firstUpdate && !props.regulatoryZoneMetadataPanelIsOpen) ? '' : props.regulatoryZoneMetadataPanelIsOpen ? 'regulatory-metadata-box-opening' : 'regulatory-metadata-box-closing'} 0.5s ease forwards;
       
    @keyframes regulatory-metadata-box-opening {
        0%   { min-height: 100px; opacity: 0; margin-left: -30px;   }
        100% { min-height: 400px; opacity: 1; margin-left: ${props => props.fromBackoffice ? '600px' : '361px'}; }
    }
    
    @keyframes regulatory-metadata-box-closing {
        0% { min-height: 400px; opacity: 1; margin-left: ${props => props.fromBackoffice ? '600px' : '361px'}; }
        100%   { min-height: 100px; opacity: 0; margin-left: -30px;   }
    }
`

export default LayersSidebar
