import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components';
import {useDispatch, useSelector} from "react-redux";
import {setError} from "../domain/reducers/Global";

import {ReactComponent as LayersSVG} from '../components/icons/Couches.svg';
import LayersEnum, {baseLayers} from "../domain/entities/layers";

import addRegulatoryZonesToMySelection from "../domain/use_cases/addRegulatoryZonesToMySelection";
import getAllRegulatoryZones from "../domain/use_cases/getAllRegulatoryZones";
import removeRegulatoryZoneFromMySelection from "../domain/use_cases/removeRegulatoryZoneFromMySelection";
import showLayer from "../domain/use_cases/showLayer";
import hideLayers from "../domain/use_cases/hideLayers";
import RegulatoryZoneSelection from "../components/regulatory_zones/RegulatoryZoneSelection";
import AdministrativeZoneSelection from "../components/administratives_zones/AdministrativeZoneSelection";
import RegulatoryZoneSelected from "../components/regulatory_zones/RegulatoryZoneSelected";
import {COLORS} from "../constants/constants";
import showRegulatoryZoneMetadata from "../domain/use_cases/showRegulatoryZoneMetadata";
import closeRegulatoryZoneMetadata from "../domain/use_cases/closeRegulatoryZoneMetadata";
import RegulatoryZoneMetadata from "../components/regulatory_zones/RegulatoryZoneMetadata";
import zoomInSubZone from "../domain/use_cases/zoomInSubZone";
import {selectBaseLayer} from "../domain/reducers/Map";
import BaseLayerSelection from "../components/base_layers/BaseLayerSelection";

const LayersSidebar = () => {
    const dispatch = useDispatch()
    const showedLayers = useSelector(state => state.layer.showedLayers)
    const selectedBaseLayer = useSelector(state => state.map.selectedBaseLayer)
    const administrativeZones = useSelector(state => state.layer.administrativeZones)
    const {
        isReadyToShowRegulatoryZones,
        regulatoryZoneMetadataPanelIsOpen,
        loadingRegulatoryZoneMetadata,
        selectedRegulatoryZones,
        regulatoryZoneMetadata
    } = useSelector(state => state.regulatory)
    const gears = useSelector(state => state.gear.gears)
    const firstUpdate = useRef(true);
    const [regulatoryZones, setRegulatoryZones] = useState();
    const [layersSidebarIsOpen, setLayersSidebarIsOpen] = useState(false);
    const [regulatoryZonesAddedToMySelection, setRegulatoryZonesAddedToMySelection] = useState(0)
    const [hideZonesListWhenSearching, setHideZonesListWhenSearching] = useState(false)

    useEffect(() => {
        if (layersSidebarIsOpen === true) {
            firstUpdate.current = false;
        }

        if(!layersSidebarIsOpen) {
            callCloseRegulatoryZoneMetadata()
        }
    }, [layersSidebarIsOpen])

    useEffect(() => {
        dispatch(getAllRegulatoryZones())
            .then(regulatoryZones => setRegulatoryZones(regulatoryZones))
            .catch(error => {
                dispatch(setError(error));
            });
    }, [])

    function callAddRegulatoryZonesToMySelection(regulatoryZonesSelection) {
        dispatch(addRegulatoryZonesToMySelection(regulatoryZonesSelection))
    }

    function callRemoveRegulatoryZoneFromMySelection(regulatoryZone) {
        callHideRegulatoryZone(regulatoryZone)
        dispatch(removeRegulatoryZoneFromMySelection(regulatoryZone))
    }

    function callShowRegulatoryZone(regulatoryZone) {
        dispatch(showLayer({
            type: LayersEnum.REGULATORY,
            zone: regulatoryZone,
        }))
    }

    function callHideRegulatoryZone(regulatoryZone) {
        dispatch(hideLayers({
            type: LayersEnum.REGULATORY,
            zone: regulatoryZone
        }))
    }

    function callShowAdministrativeZone(administrativeZone) {
        dispatch(showLayer({
            type: administrativeZone
        }));
    }

    function callHideAdministrativeZone(administrativeZone) {
        dispatch(hideLayers({
            type: administrativeZone
        }));
    }

    function callShowRegulatorySubZoneMetadata(regulatorySubZone) {
        dispatch(showRegulatoryZoneMetadata(regulatorySubZone))
    }

    function callCloseRegulatoryZoneMetadata() {
        dispatch(closeRegulatoryZoneMetadata())
    }

    function callZoomInSubZone(subZone) {
        dispatch(zoomInSubZone(subZone))
    }

    function callSelectBaseLayer(baseLayer) {
        dispatch(selectBaseLayer(baseLayer))
    }

    return (
        <Sidebar
            layersSidebarIsOpen={layersSidebarIsOpen}
            firstUpdate={firstUpdate.current}>
            <SidebarLayersIcon
                title={"Couches réglementaires"}
                layersSidebarIsOpen={layersSidebarIsOpen}
                regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
                onClick={() => setLayersSidebarIsOpen(!layersSidebarIsOpen)}>
                <Layers/>
            </SidebarLayersIcon>
            <RegulatoryZoneSelection
                callAddRegulatoryZonesToMySelection={callAddRegulatoryZonesToMySelection}
                callCloseRegulatoryZoneMetadata={callCloseRegulatoryZoneMetadata}
                regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
                regulatoryZones={regulatoryZones}
                gears={gears}
                regulatoryZonesAddedToMySelection={regulatoryZonesAddedToMySelection}
                setRegulatoryZonesAddedToMySelection={setRegulatoryZonesAddedToMySelection}
                layersSidebarIsOpen={layersSidebarIsOpen}
                setHideZonesListWhenSearching={setHideZonesListWhenSearching}
            />
            <Zones>
                <RegulatoryZoneSelected
                    isReadyToShowRegulatoryZones={isReadyToShowRegulatoryZones}
                    callRemoveRegulatoryZoneFromMySelection={callRemoveRegulatoryZoneFromMySelection}
                    callShowRegulatoryZone={callShowRegulatoryZone}
                    callHideRegulatoryZone={callHideRegulatoryZone}
                    callShowRegulatorySubZoneMetadata={callShowRegulatorySubZoneMetadata}
                    showedLayers={showedLayers}
                    regulatoryZonesAddedToMySelection={regulatoryZonesAddedToMySelection}
                    selectedRegulatoryZones={selectedRegulatoryZones}
                    gears={gears}
                    callCloseRegulatoryZoneMetadata={callCloseRegulatoryZoneMetadata}
                    callZoomInSubZone={callZoomInSubZone}
                    regulatoryZoneMetadata={regulatoryZoneMetadata}
                    hideZonesListWhenSearching={hideZonesListWhenSearching}
                />
                <AdministrativeZoneSelection
                    administrativeZones={administrativeZones}
                    showedLayers={showedLayers}
                    callShowAdministrativeZone={callShowAdministrativeZone}
                    callHideAdministrativeZone={callHideAdministrativeZone}
                    hideZonesListWhenSearching={hideZonesListWhenSearching}
                />
                <BaseLayerSelection
                    baseLayers={Object.keys(baseLayers)}
                    selectedBaseLayer={selectedBaseLayer}
                    callSelectBaseLayer={callSelectBaseLayer}
                />
            </Zones>
            <RegulatoryZoneMetadata
                loadingRegulatoryZoneMetadata={loadingRegulatoryZoneMetadata}
                regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
                regulatoryZoneMetadata={regulatoryZoneMetadata}
                callCloseRegulatoryZoneMetadata={callCloseRegulatoryZoneMetadata}
                gears={gears}
                layersSidebarIsOpen={layersSidebarIsOpen}
            />
        </Sidebar>
    )
}

const Sidebar = styled.div`
  margin-left: -373px;
  top: 10px;
  left: 12px;
  z-index: 9999;
  border-radius: 1px;
  position: absolute;
  display: inline-block;
  animation: ${props => props.firstUpdate && !props.layersSidebarIsOpen ? '' : props.layersSidebarIsOpen ? 'left-sidebar-opening' : 'left-sidebar-closing'} 0.5s ease forwards;

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
`

const SidebarLayersIcon = styled.button`
  position: absolute;
  display: inline-block;
  color: #05055E;
  background: ${props => props.firstUpdate && !props.layersSidebarIsOpen ? COLORS.grayDarkerThree : props.layersSidebarIsOpen ? '#9A9A9A' : COLORS.grayDarkerThree };
  padding: 2px 2px 2px 2px;
  margin-top: 0;
  margin-left: ${props => props.firstUpdate && !props.layersSidebarIsOpen ? '190px' : props.layersSidebarIsOpen ? '187px' : '190px' };
  border-radius: 1px;
  height: 40px;
  width: 40px;

  :hover, :focus {
      background: ${props => props.firstUpdate && !props.layersSidebarIsOpen ? COLORS.grayDarkerThree : props.layersSidebarIsOpen ? '#9A9A9A' : COLORS.grayDarkerThree };
  }
`

const Layers = styled(LayersSVG)`
  width: 35px;
  height: 35px;
`

export default LayersSidebar
