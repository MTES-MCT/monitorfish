import React, {useState} from "react";
import styled from 'styled-components';
import {ReactComponent as ChevronIconSVG} from './icons/Chevron_double_gris.svg'
import RegulatoryZoneSelectedItem from "./RegulatoryZoneSelectedItem";

const RegulatoryZoneSelected = props => {
    const [showRegulatoryZonesSelected, setShowRegulatoryZonesSelected] = useState(true);

    return (
        <>
            <RegulatoryZoneSelectedTitle onClick={() => setShowRegulatoryZonesSelected(!showRegulatoryZonesSelected)}>
                Mes zones réglementaires <ChevronIcon isOpen={showRegulatoryZonesSelected}/>
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
                                callHideRegulatoryZone={props.callHideRegulatoryZone}
                                showedLayers={props.showedLayers}
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
    0%   {
        height: 0;
        overflow-y: hidden;
    }
    100% {
        height: 300px;
        overflow-y: auto;
    }
  }

  @keyframes regulatory-selected-closing {
    0%   {
        height: 300px;
        overflow-y: hidden !important;
    }
    100% {
        height: 0;
        overflow-y: auto;
    }
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
