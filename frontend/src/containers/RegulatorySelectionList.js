import React, {useEffect, useRef, useState} from "react";
import {ReactComponent as ShowIcon} from "../components/icons/eye.svg";
import {ReactComponent as HideIcon} from "../components/icons/eye_not.svg";
import {useDispatch} from "react-redux";
import styled from "styled-components";
import showLayer from "../use_cases/showLayer";
import hideLayer from "../use_cases/hideLayer";
import RegulatoryZoneSelectionItem from "./RegulatoryZoneSelectionItem";

const RegulatorySelectionList = props => {
    const [foundRegulatoryZones, setFoundRegulatoryZones] = useState({})
    const [regulatoryZones, setRegulatoryZones] = useState({})

    useEffect(() => {
        //let layerNames = new Set(props.foundRegulatoryZones.map(layer => layer.layerName))
        setLayerNames([...layerNames])

        setFoundRegulatoryZones(props.foundRegulatoryZones)
    }, [props.foundRegulatoryZones])

    return (
        <List showRegulatorySearchInput={props.showRegulatorySection} foundRegulatoryZones={props.foundRegulatoryZones}>
            {
                Object.keys()
                foundRegulatoryZones.map((regulatoryZone, index) => {
                    return (<ListItem key={index}>
                        <RegulatoryZoneSelectionItem
                            layerName={regulatoryZone.layerName}
                            toggleSelectRegulatoryZone={props.toggleSelectRegulatoryZone}
                            isSelected={props.regulatoryZonesSelection.some(selected => selected.filter === regulatoryZone.layerName)}
                        />
                    </ListItem>)
                })
            }
        </List>
    );
}

const List = styled.ul`
  margin: 0;
  background-color: #05055E;
  border-radius: 0;
  padding: 0;
  height: 200px;
  max-height: 200px;
  overflow-y: scroll;
  overflow-x: hidden;
  
  animation: ${props => props.showRegulatorySearchInput ? props.foundRegulatoryZones.length > 0 ? 'regulatory-input-opening' : 'regulatory-input-closing' : 'regulatory-input-closing'} 1s ease forwards;

  @keyframes regulatory-result-opening {
    0%   { height: 0;   }
    100% { height: 200px; }
  }

  @keyframes regulatory-result-closing {
    0%   { height: 200px; }
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

export default RegulatorySelectionList
