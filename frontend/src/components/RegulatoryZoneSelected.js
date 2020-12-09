import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components';
import {useDispatch, useSelector} from "react-redux";
import {setError} from "../reducers/Global";

import {ReactComponent as LayersSVG} from './icons/layers.svg';
import {ReactComponent as ChevronIconSVG} from './icons/Chevron_double_gris.svg'

import addRegulatoryZonesToMySelection from "../use_cases/addRegulatoryZonesToMySelection";
import RegulatoryZoneSelectedItem from "./RegulatoryZoneSelectedItem";
import getAllRegulatoryZones from "../use_cases/getAllRegulatoryZones";
import removeRegulatoryZoneFromMySelection from "../use_cases/removeRegulatoryZoneFromMySelection";
import showLayer from "../use_cases/showLayer";
import hideLayer from "../use_cases/hideLayer";
import RegulatoryZoneSelection from "./RegulatoryZoneSelection";
import AdministrativeZoneSelection from "./AdministrativeZoneSelection";

const RegulatoryZoneSelected = props => {
    const [showRegulatoryZonesSelected, setShowRegulatoryZonesSelected] = useState(true);

    return (
        <>
            <RegulatoryZoneSelectedTitle onClick={() => setShowRegulatoryZonesSelected(!showRegulatoryZonesSelected)}>
                Mes zones <ChevronIcon isOpen={showRegulatoryZonesSelected}/>
            </RegulatoryZoneSelectedTitle>
            <RegulatoryZoneSelectedList showRegulatoryZonesSelected={showRegulatoryZonesSelected}>
                {
                    Object.keys(props.selectedRegulatoryZones).map((regulatoryZoneName, index) => {
                        return (<ListItem key={index}>
                            <RegulatoryZoneSelectedItem
                                callRemoveRegulatoryZoneFromMySelection={props.callRemoveRegulatoryZoneFromMySelection}
                                regulatoryZoneName={regulatoryZoneName}
                                regulatorySubZones={props.selectedRegulatoryZones[regulatoryZoneName]}
                                callShowRegulatoryZone={props.callShowRegulatoryZone}
                                isShownOnInit={props.showedLayers.some(layer_ => layer_.type === regulatoryZoneName.layer && layer_.filter && layer_.filter === regulatoryZoneName.filter)}
                            />
                        </ListItem>)
                    })
                }
            </RegulatoryZoneSelectedList>
        </>
    )
}

const RegulatoryZoneSelectedTitle = styled.div`
  height: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  background: #2F006F;
  font-size: 0.8em;
  padding-top: 10px;
  cursor: pointer;
  font-weight: 500;
  text-align: left;
  padding-left: 10px;
  user-select: none;
`

const RegulatoryZoneSelectedList = styled.ul`
  margin: 0;
  background-color: #05055E;
  border-radius: 0;
  padding: 0;
  height: 0px;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  
  animation: ${props => props.showRegulatoryZonesSelected ? 'regulatory-selected-opening' : 'regulatory-selected-closing'} 1s ease forwards;

  @keyframes regulatory-selected-opening {
    0%   { height: 0;   }
    100% { height: 300px; }
  }

  @keyframes regulatory-selected-closing {
    0%   { height: 300px; }
    100% { height: 0;   }
  }
`

const ListItem = styled.li`
  padding: 0px 5px 0px 0px;
  margin: 0;
  font-size: 0.8em;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  cursor: pointer;
  margin: 0;
  border-bottom: rgba(255, 255, 255, 0.2) 1px solid;
  line-height: 1.9em;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 10px;
  float: right;
  margin-right: 10px;
  margin-top: 5px;
  
  animation: ${props => props.isOpen ? 'chevron-zones-opening' : 'chevron-zones-closing'} 1s ease forwards;

  @keyframes chevron-zones-opening {
    0%   { transform: rotate(180deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes chevron-zones-closing {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(180deg);   }
  }
`

export default RegulatoryZoneSelected
