import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components';
import {ReactComponent as ChevronIconSVG} from '../icons/Chevron_simple_gris.svg'

import AdministrativeZone from "./AdministrativeZone";
import {COLORS} from "../../constants/constants";
import AdministrativeZoneGroup from "./AdministrativeZoneGroup";

const AdministrativeZones = props => {
    const [showZones, setShowZones] = useState(false);
    const [zones, setZones] = useState(false);
    const firstUpdate = useRef(true);

    useEffect(() => {
        if (firstUpdate) {
            firstUpdate.current = false
        } else {
            if(props.hideZonesListWhenSearching) {
                setShowZones(false)
            } else {
                setShowZones(true)
            }
        }
    }, [props.hideZonesListWhenSearching])

    useEffect(() => {
        let nextZones = []
        if(props.administrativeZones && props.administrativeZones.length) {
            nextZones = props.administrativeZones
                .filter(zone => !zone.group)
                .map(zone => [zone])

            let groups = [...new Set(props.administrativeZones
                .filter(zone => zone.group)
                .map(zone => zone.group))]

            groups.forEach(group => {
                nextZones.push(props.administrativeZones
                    .filter(zone => zone.group && zone.group === group))
            })
            setZones(nextZones)
        }
    }, [props.administrativeZones])

    return (
        <>
            <SectionTitle onClick={() => setShowZones(!showZones)} showZones={showZones}>
                Zones administratives <ChevronIcon isOpen={showZones}/>
            </SectionTitle>
            {
                zones && zones.length ? <ZonesList showZones={showZones} zonesLength={zones.length}>
                    {
                        zones.map((layers, index) => {
                            if(layers.length === 1 && layers[0]) {
                                return <ListItem key={layers[0].code}>
                                    <AdministrativeZone
                                        isShownOnInit={props.showedLayers.some(layer_ => layer_.type === layers[0].code)}
                                        layer={layers[0]}
                                        callShowAdministrativeZone={props.callShowAdministrativeZone}
                                        callHideAdministrativeZone={props.callHideAdministrativeZone}
                                    />
                                </ListItem>
                            } else {
                                return <ListItem key={layers[0].group.code}>
                                    <AdministrativeZoneGroup
                                        isLastItem={zones.length === index + 1}
                                        layers={layers}
                                        showedLayers={props.showedLayers}
                                        callShowAdministrativeZone={props.callShowAdministrativeZone}
                                        callHideAdministrativeZone={props.callHideAdministrativeZone}
                                    />
                                </ListItem>
                            }
                        })
                    }
                </ZonesList> : null
            }
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
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  border-bottom-left-radius: ${props => props.showZones ? '0' : '2px'};
  border-bottom-right-radius: ${props => props.showZones ? '0' : '2px'};
`

const ZonesList = styled.ul`
  margin: 0;
  border-radius: 0;
  padding: 0;
  height: 0;
  overflow-x: hidden;
  max-height: 500px;
  
  animation: ${props => props.showZones ? 'admin-zones-opening' : 'admin-zones-closing'} 0.5s ease forwards;

  @keyframes admin-zones-opening {
    0%   { height: 0;   }
    100% { height: ${props => props.zonesLength ? `${38 * props.zonesLength}px` : '175px'}; }
  }

  @keyframes admin-zones-closing {
    0%   { height: ${props => props.zonesLength ? `${38 * props.zonesLength}px` : '175px'}; }
    100% { height: 0;   }
  }
  
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`

const ListItem = styled.li`
  padding: 8px 5px 3px 0px;
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

export default AdministrativeZones
