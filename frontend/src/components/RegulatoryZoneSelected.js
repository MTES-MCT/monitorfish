import React, {useEffect, useState} from "react";
import styled from 'styled-components';
import {ReactComponent as ChevronIconSVG} from './icons/Chevron_double_gris.svg'
import RegulatoryZoneSelectedLayer from "./RegulatoryZoneSelectedLayer";
import {COLORS} from "../constants/constants";

const RegulatoryZoneSelected = props => {
    const [showRegulatoryZonesSelected, setShowRegulatoryZonesSelected] = useState(false);
    const [numberOfZonesOpened, setNumberOfZonesOpened] = useState(0)

    function increaseNumberOfZonesOpened(number) {
        setNumberOfZonesOpened(numberOfZonesOpened + number)
    }

    function decreaseNumberOfZonesOpened(number) {
        const value = numberOfZonesOpened - number
        if (value < 0) {
            setNumberOfZonesOpened(0)
        } else {
            setNumberOfZonesOpened(value)
        }
    }

    useEffect(() => {
        console.log(props.regulatoryZonesAddedToMySelection)
    }, [props.regulatoryZonesAddedToMySelection])

    return (
        <>
            <RegulatoryZoneSelectedTitle
                onClick={() => setShowRegulatoryZonesSelected(!showRegulatoryZonesSelected)}
                regulatoryZonesAddedToMySelection={props.regulatoryZonesAddedToMySelection}
            >
                Mes zones réglementaires <ChevronIcon isOpen={showRegulatoryZonesSelected}/>
            </RegulatoryZoneSelectedTitle>
            <RegulatoryZoneSelectedList
                layerLength={Object.keys(props.selectedRegulatoryZones).length}
                zoneLength={numberOfZonesOpened}
                showRegulatoryZonesSelected={showRegulatoryZonesSelected}
            >
                {
                    Object.keys(props.selectedRegulatoryZones).map((regulatoryZoneName, index) => {
                        return (<ListItem key={index}>
                            <RegulatoryZoneSelectedLayer
                                increaseNumberOfZonesOpened={increaseNumberOfZonesOpened}
                                decreaseNumberOfZonesOpened={decreaseNumberOfZonesOpened}
                                isReadyToShowRegulatoryZones={props.isReadyToShowRegulatoryZones}
                                callRemoveRegulatoryZoneFromMySelection={props.callRemoveRegulatoryZoneFromMySelection}
                                regulatoryZoneName={regulatoryZoneName}
                                regulatorySubZones={props.selectedRegulatoryZones[regulatoryZoneName]}
                                callShowRegulatoryZone={props.callShowRegulatoryZone}
                                callHideRegulatoryZone={props.callHideRegulatoryZone}
                                callShowRegulatorySubZoneMetadata={props.callShowRegulatorySubZoneMetadata}
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
  height: 27px;
  padding-top: 8px;
  margin-top: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  background: ${COLORS.grayDarker};
  
  animation: ${props => props.regulatoryZonesAddedToMySelection ? 'blink' : ''} 0.3s ease forwards;

  @keyframes blink {
    0%   {
        background: ${COLORS.grayDarker};
    }
    20%   {
        background: ${COLORS.grayDarkerTwo};
    }
    40% {
        background: ${COLORS.grayDarker};
    }
    60%   {
        background: ${COLORS.grayDarker};
    }
    80%   {
        background: ${COLORS.grayDarkerTwo};
    }
    100% {
        background: ${COLORS.grayDarker};
    }
  }
  
  color: ${COLORS.grayDarkerTwo};
  font-size: 0.8em;
  cursor: pointer;
  font-weight: 500;
  text-align: left;
  padding-left: 15px;
  user-select: none;
`

const RegulatoryZoneSelectedList = styled.ul`
  margin: 0;
  background-color: ${COLORS.background};
  border-radius: 0;
  padding: 0;
  height: ${props => {
        if(props.layerLength) {
            if(props.zoneLength > 0) {
                return props.layerLength * 36 + props.zoneLength * 36
            } else {
                return props.layerLength * 36
            }
        } else {
            return 20
        }
    }}px;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  color: ${COLORS.grayDarkerThree};
  
  animation: ${props => props.showRegulatoryZonesSelected ? 'regulatory-selected-opening' : 'regulatory-selected-closing'} 0.5s ease forwards;

  @keyframes regulatory-selected-opening {
    0%   {
        height: 0;
        overflow-y: hidden;
    }
    100% {
        height: ${props => {
            if(props.layerLength) {
                if(props.zoneLength) {
                    return props.layerLength * 36 + props.zoneLength * 36
                } else {
                    return props.layerLength * 36
                }
            } else {
              return 20
            }  
        }}px;
        overflow-y: auto;
    }
  }

  @keyframes regulatory-selected-closing {
    0%   {
        height: ${props => {
            if(props.layerLength) {
                if(props.zoneLength > 0) {
                    return props.layerLength * 36 + props.zoneLength * 27
                } else {
                    return props.layerLength * 36
                }
            } else {
                return 20
            }
        }}px;
        overflow-y: hidden !important;
    }
    100% {
        height: 0;
        overflow-y: hidden;
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
  width: 12px;
  float: right;
  margin-right: 10px;
  margin-top: 5px;
  
  animation: ${props => props.isOpen ? 'chevron-zones-opening' : 'chevron-zones-closing'} 0.5s ease forwards;

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
