import React, {useEffect, useState} from "react";
import styled from "styled-components";
import RegulatoryZoneSelectedZone from "./RegulatoryZoneSelectedZone";
import LayersEnum from "../domain/entities/layers";
import {COLORS} from "../constants/constants";
import {ReactComponent as ChevronIconSVG} from './icons/Chevron_simple_gris.svg'
import {getHash} from "../utils";
import {getGearCategory} from "../domain/use_cases/showLayer";
import {getVectorLayerStyle} from "../layers/styles/vectorLayerStyles";
import Layers from "../domain/entities/layers";

const RegulatoryZoneSelectedLayer = props => {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (props.increaseNumberOfZonesOpened && props.decreaseNumberOfZonesOpened) {
            if (isOpen) {
                props.increaseNumberOfZonesOpened(props.regulatorySubZones.length)
            } else {
                props.decreaseNumberOfZonesOpened(props.regulatorySubZones.length)
            }
        }
    }, [isOpen])

    return (
        <Row>
            <Zone onClick={() => setIsOpen(!isOpen)}>
                <ChevronIcon isOpen={isOpen}/> {props.regulatoryZoneName.replace(/[_]/g, ' ')}
            </Zone>
            <List
                isOpen={isOpen}
                name={props.regulatoryZoneName.replace(/\s/g, '-')}
                length={props.regulatorySubZones.length}>
                {
                    props.regulatorySubZones ? props.regulatorySubZones.map((subZone, index) => {
                        let vectorLayerStyle
                        if(subZone.zone && subZone.layerName && subZone.gears && props.gears) {
                            let hash = getHash(`${subZone.layerName}:${subZone.zone}`)
                            let gearCategory = getGearCategory(subZone.gears, props.gears);
                            vectorLayerStyle = getVectorLayerStyle(Layers.REGULATORY)(null, hash, gearCategory)
                        }

                        return (
                            <RegulatoryZoneSelectedZone
                                subZone={subZone}
                                vectorLayerStyle={vectorLayerStyle}
                                key={index}
                                isReadyToShowRegulatoryZones={props.isReadyToShowRegulatoryZones}
                                callRemoveRegulatoryZoneFromMySelection={props.callRemoveRegulatoryZoneFromMySelection}
                                callShowRegulatoryZone={props.callShowRegulatoryZone}
                                callHideRegulatoryZone={props.callHideRegulatoryZone}
                                callShowRegulatorySubZoneMetadata={props.callShowRegulatorySubZoneMetadata}
                                callCloseRegulatoryZoneMetadata={props.callCloseRegulatoryZoneMetadata}
                                regulatoryZoneMetadata={props.regulatoryZoneMetadata}
                                isShowOnInit={props.showedLayers
                                    .filter(layer => layer.type === LayersEnum.REGULATORY)
                                    .some(layer =>
                                        layer.zone.layerName === subZone.layerName &&
                                        layer.zone.zone === subZone.zone)}
                            />
                        )
                    }) : null
                }
            </List>
        </Row>
    )}

const Zone = styled.span`
  width: 100%;
  display: block;
  line-height: 2.7em;
  font-size: 13px;
  padding-left: 10px;
  user-select: none;
  border-bottom: 1px solid ${COLORS.gray};
`

const List = styled.div`
  height: inherit;
  overflow: hidden;
  animation: ${props => props.isOpen ? `list-zones-${props.name}-opening` : `list-zones-${props.name}-closing`} 0.2s ease forwards;

  @keyframes ${props => props.name ? `list-zones-${props.name}-opening` : null} {
    0%   { height: 0px; }
    100% { height: ${props => props.length * 38}px; }
  }

  @keyframes ${props => props.name ? `list-zones-${props.name}-closing` : null} {
    0%   { height: ${props => props.length * 38}px; }
    100% { height: 0px;   }
  }
`

const Row = styled.div`
  width: 100%;
  display: block;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 14px;
  margin-right: 5px;
  margin-top: 5px;
  
  animation: ${props => props.isOpen ? 'chevron-layer-opening' : 'chevron-layer-closing'} 0.5s ease forwards;

  @keyframes chevron-layer-opening {
    0%   { transform: rotate(180deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes chevron-layer-closing {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(180deg);   }
  }
`

export default RegulatoryZoneSelectedLayer
