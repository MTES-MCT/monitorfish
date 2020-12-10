import React, {useState} from "react";
import styled from 'styled-components';

import RegulatoryZoneSelectionSearchInput from "./RegulatoryZoneSelectionSearchInput";
import {ReactComponent as SearchIconSVG} from './icons/search.svg'
import {ReactComponent as CloseIconSVG} from './icons/Croix_grise.svg'
import RegulatoryZoneSelectionList from "./RegulatoryZoneSelectionList";

const RegulatoryZoneSelection = props => {
    const [showRegulatorySection, setShowRegulatorySection] = useState(false);
    const [foundRegulatoryZones, setFoundRegulatoryZones] = useState({});
    const [regulatoryZonesSelection, setRegulatoryZonesSelection] = useState({})

    const toggleSelectRegulatoryZone = (regulatoryZoneName, regulatorySubZones) => {
        let existingSelectedZones = {...regulatoryZonesSelection}

        if(!regulatoryZonesSelection[regulatoryZoneName] || !regulatoryZonesSelection[regulatoryZoneName].length) {
            existingSelectedZones[regulatoryZoneName] = regulatorySubZones
            setRegulatoryZonesSelection(existingSelectedZones)
        } else {
            regulatorySubZones.forEach(regulatorySubZone => {
                if(existingSelectedZones[regulatoryZoneName].some(item =>
                    item.layerName === regulatorySubZone.layerName &&
                    item.zone === regulatorySubZone.zone)) {
                    existingSelectedZones[regulatoryZoneName] = existingSelectedZones[regulatoryZoneName].filter(item =>
                        !(item.layerName === regulatorySubZone.layerName &&
                        item.zone === regulatorySubZone.zone))
                    if(!existingSelectedZones[regulatoryZoneName].length) {
                        delete existingSelectedZones[regulatoryZoneName]
                    }
                } else {
                    existingSelectedZones[regulatoryZoneName] = existingSelectedZones[regulatoryZoneName].concat(regulatorySubZone)
                }
                setRegulatoryZonesSelection(existingSelectedZones)
            })
        }
    }

    function addRegulatoryZonesToMySelection(regulatoryZonesSelection) {
        props.callAddRegulatoryZonesToMySelection(regulatoryZonesSelection)
        setRegulatoryZonesSelection({})
    }

    return (<>
        <RegulatoryZoneTitle onClick={() => setShowRegulatorySection(!showRegulatorySection)}>
            Rechercher des zones réglementaires
            {
                showRegulatorySection ? <CloseIcon /> : <SearchIcon />
            }
        </RegulatoryZoneTitle>
        <RegulatoryZoneSelectionSearchInput
            showRegulatorySearchInput={showRegulatorySection}
            regulatoryZones={props.regulatoryZones}
            setFoundRegulatoryZones={setFoundRegulatoryZones}
            foundRegulatoryZones={foundRegulatoryZones}
        />
        <RegulatoryZoneSelectionList
            showRegulatorySearchInput={showRegulatorySection}
            foundRegulatoryZones={foundRegulatoryZones}
            showRegulatorySection={showRegulatorySection}
            regulatoryZonesSelection={regulatoryZonesSelection}
            toggleSelectRegulatoryZone={toggleSelectRegulatoryZone}
        />
        <RegulatoryZoneAddButton
            onClick={() => addRegulatoryZonesToMySelection(regulatoryZonesSelection)}
            showRegulatorySearchInput={showRegulatorySection}
            foundRegulatoryZones={foundRegulatoryZones}
        >
            Ajouter à mes zones
        </RegulatoryZoneAddButton>
    </>
    )
}

const RegulatoryZoneAddButton = styled.div`
  cursor: pointer;
  border-radius: 0;
  font-size: 0.8em;
  background: rgba(255, 255, 255, 0.3);
  padding: 0;
  line-height: 1.9em;
  margin: 0;
  height: 0;
  width: 100%;
  overflow: hidden;
  user-select: none;
  animation: ${props => props.showRegulatorySearchInput ? Object.keys(props.foundRegulatoryZones).length > 0 ? 'regulatory-button-opening' : 'regulatory-button-closing' : 'regulatory-button-closing'} 1s ease forwards;

  @keyframes regulatory-button-opening {
    0%   { height: 0;   }
    100% { height: 25px; }
  }

  @keyframes regulatory-button-closing {
    0%   { height: 25px; }
    100% { height: 0;   }
  }
`

const RegulatoryZoneTitle = styled.div`
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

const SearchIcon = styled(SearchIconSVG)`
  margin-bottom: -11px;
  border-radius: 2px;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  width: 17px;
  height: 17px;
  float: right;
  margin-right: 5px;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 10px;
  float: right;
  margin-right: 7px;
  margin-top: 5px;
`

export default RegulatoryZoneSelection
