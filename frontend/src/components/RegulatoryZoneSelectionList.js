import React, {useEffect, useState} from "react";
import styled from "styled-components";
import RegulatoryZoneSelectionItem from "./RegulatoryZoneSelectionItem";
import {COLORS} from "../constants/constants";

const RegulatoryZoneSelectionList = props => {
    const [foundRegulatoryZones, setFoundRegulatoryZones] = useState({})

    useEffect(() => {
        setFoundRegulatoryZones(props.foundRegulatoryZones)
    }, [props.foundRegulatoryZones])

    return (
        <List showRegulatorySearchInput={props.showRegulatorySection} foundRegulatoryZones={foundRegulatoryZones}>
            {
                foundRegulatoryZones && Object.keys(foundRegulatoryZones).length > 0 ? Object.keys(foundRegulatoryZones).map((regulatoryZoneName, index) => {
                    return (<ListItem key={index}>
                        <RegulatoryZoneSelectionItem
                            key={index}
                            regulatorySubZones={foundRegulatoryZones[regulatoryZoneName]}
                            regulatoryZoneName={regulatoryZoneName}
                            toggleSelectRegulatoryZone={props.toggleSelectRegulatoryZone}
                            regulatoryZonesSelection={props.regulatoryZonesSelection}
                            gears={props.gears}
                        />
                    </ListItem>)
                }) : null
            }
        </List>
    );
}

const List = styled.ul`
  margin: 0;
  background: ${COLORS.background};
  border-radius: 0;
  padding: 0;
  height: 200px;
  max-height: 200px;
  overflow-y: scroll;
  overflow-x: hidden;
  color: ${COLORS.textGray};
  
  animation: ${props => props.showRegulatorySearchInput && props.foundRegulatoryZones ? Object.keys(props.foundRegulatoryZones).length > 0 ? 'regulatory-result-opening' : 'regulatory-result-closing' : 'regulatory-result-closing'} 0.5s ease forwards;

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
  line-height: 1.9em;
`

export default RegulatoryZoneSelectionList
