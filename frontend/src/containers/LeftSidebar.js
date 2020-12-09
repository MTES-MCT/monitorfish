import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components';
import {useDispatch, useSelector} from "react-redux";
import {setError} from "../reducers/Global";

import {ReactComponent as LayersSVG} from '../components/icons/layers.svg';

import addRegulatoryZonesToMySelection from "../use_cases/addRegulatoryZonesToMySelection";
import getAllRegulatoryZones from "../use_cases/getAllRegulatoryZones";
import removeRegulatoryZoneFromMySelection from "../use_cases/removeRegulatoryZoneFromMySelection";
import showLayer from "../use_cases/showLayer";
import hideLayer from "../use_cases/hideLayer";
import RegulatoryZoneSelection from "../components/RegulatoryZoneSelection";
import AdministrativeZoneSelection from "../components/AdministrativeZoneSelection";
import RegulatoryZoneSelected from "../components/RegulatoryZoneSelected";

const LeftSidebar = () => {
    const dispatch = useDispatch()
    const firstUpdate = useRef(true);
    const showedLayers = useSelector(state => state.layer.showedLayers)
    const selectedRegulatoryZones = useSelector(state => state.layer.selectedRegulatoryZones)
    const zones = useSelector(state => state.layer.zones)
    const [regulatoryZones, setRegulatoryZones] = useState();
    const [openBox, setOpenBox] = useState(false);

    useEffect(() => {
        if (openBox === true) {
            firstUpdate.current = false;
        }
    }, [openBox])

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
        dispatch(removeRegulatoryZoneFromMySelection(regulatoryZone))
    }

    function callShowRegulatoryZone(regulatoryZone) {
        dispatch(showLayer({
            type: Layers.REGULATORY,
            zone: regulatoryZone
        }))
    }

    function callHideRegulatoryZone(regulatoryZone) {
        dispatch(hideLayer({
            type: Layers.REGULATORY,
            zone: regulatoryZone
        }))
    }

    function callShowAdministrativeZone(administrativeZone) {
        dispatch(showLayer({
            type: administrativeZone
        }));
    }

    function callHideAdministrativeZone(administrativeZone) {
        dispatch(hideLayer({
            type: administrativeZone
        }));
    }

    return (
        <Wrapper openBox={openBox} firstUpdate={firstUpdate.current}>
            <SidebarLayersIcon onClick={() => setOpenBox(!openBox)}><Layers/></SidebarLayersIcon>
            <RegulatoryZoneSelection
                callAddRegulatoryZonesToMySelection={callAddRegulatoryZonesToMySelection}
                regulatoryZones={regulatoryZones}
            />
            <AdministrativeZoneSelection
                zones={zones}
                showedLayers={showedLayers}
                callShowAdministrativeZone={callShowAdministrativeZone}
                callHideAdministrativeZone={callHideAdministrativeZone}
            />
            <RegulatoryZoneSelected
                callRemoveRegulatoryZoneFromMySelection={callRemoveRegulatoryZoneFromMySelection}
                callShowRegulatoryZone={callShowRegulatoryZone}
                showedLayers={showedLayers}
                selectedRegulatoryZones={selectedRegulatoryZones}
            />
        </Wrapper>
    )
}

const Wrapper = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  width: 270px;
  position: absolute;
  display: inline-block;
  top: 50px;
  left: 0;
  z-index: 999999;
  color: white;
  text-decoration: none;
  border: none;
  background-color: rgba(5, 5, 94, 1);
  padding: 0;
  margin-left: -270px;
  height: calc(100vh - 50px);
  
  animation: ${props => props.firstUpdate && !props.openBox ? '' : props.openBox ? 'regulatory-box-opening' : 'regulatory-box-closing'} 1s ease forwards;

  @keyframes regulatory-box-opening {
    0%   { margin-left: -270px;   }
    100% { margin-left: 0; }
  }

  @keyframes regulatory-box-closing {
    0% { margin-left: 0; }
    100%   { margin-left: -270px;   }
  }
`

const SidebarLayersIcon = styled.button`
  position: absolute;
  display: inline-block;
  color: #05055E;
  background: rgba(5, 5, 94, 1);
  background: linear-gradient(to right, #2F006F, rgba(5, 5, 94, 1));
  padding: 3px 1px 3px 1px;
  margin-left: 135px;
  border-radius: 4px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 0;
  height: 40px;
  margin-top: 0;
  border-left: none;
    
  :hover, :focus {
    background: linear-gradient(to right, #2F006F, rgba(5, 5, 94, 1));
  }
`

const Layers = styled(LayersSVG)`
  width: 30px;
`

export default LeftSidebar
