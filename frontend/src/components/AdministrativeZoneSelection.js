import React, {useEffect, useState} from "react";
import styled from 'styled-components';
import {ReactComponent as ChevronIconSVG} from './icons/Chevron_simple_gris.svg'

import AdministrativeZoneItem from "./AdministrativeZoneItem";
import {COLORS} from "../constants/constants";

const AdministrativeZoneSelection = props => {
    const [showZones, setShowZones] = useState(false);

    useEffect(() => {
        if(props.hideZonesListWhenSearching) {
            setShowZones(false)
        } else {
            setShowZones(true)
        }
    }, [props.hideZonesListWhenSearching])

    return (
        <>
            <SectionTitle onClick={() => setShowZones(!showZones)}>
                Zones administratives <ChevronIcon isOpen={showZones}/>
            </SectionTitle>
            <ZonesList showZones={showZones} zonesLength={props.administrativeZones.length}>
                {
                    props.administrativeZones.map((layer, index) => {
                        return (<ListItem key={index}>
                            <AdministrativeZoneItem
                                isShownOnInit={props.showedLayers.some(layer_ => layer_.type === layer.layer)}
                                layer={layer}
                                callShowAdministrativeZone={props.callShowAdministrativeZone}
                                callHideAdministrativeZone={props.callHideAdministrativeZone}
                            />
                        </ListItem>)
                    })
                }
            </ZonesList>
        </>
    )
}

const SectionTitle = styled.div`
  height: 27px;
  margin-top: 10px;
  padding-top: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  background: ${COLORS.grayDarker};
  color: ${COLORS.grayDarkerTwo};
  font-size: 0.8em;
  padding-top: 10px;
  cursor: pointer;
  font-weight: 500;
  text-align: left;
  padding-left: 15px;
  user-select: none;
`

const ZonesList = styled.ul`
  margin: 0;
  border-radius: 0;
  padding: 0;
  height: 0;
  overflow-y: hidden;
  overflow-x: hidden;
  
  animation: ${props => props.showZones ? 'zones-opening' : 'zones-closing'} 0.5s ease forwards;

  @keyframes zones-opening {
    0%   { height: 0;   }
    100% { height: ${props => props.zonesLength ? `${36 * props.zonesLength}px` : '175px'}; }
  }

  @keyframes zones-closing {
    0%   { height: ${props => props.zonesLength ? `${36 * props.zonesLength}px` : '175px'}; }
    100% { height: 0;   }
  }
`

const ListItem = styled.li`
  padding: 6px 5px 5px 0px;
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
  background: ${COLORS.background};
  color: ${COLORS.grayDarkerThree};
  border-bottom: 1px solid ${COLORS.gray};
  line-height: 1.9em;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 17px;
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

export default AdministrativeZoneSelection
