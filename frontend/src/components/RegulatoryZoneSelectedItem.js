import React from "react";
import styled from "styled-components";
import RegulatoryZoneSelectedSubZone from "./RegulatoryZoneSelectedSubZone";
import LayersEnum from "../domain/layers";

const RegulatoryZoneSelectedItem = props => {
    return (
        <Row>
            <Zone>
                {props.regulatoryZoneName.replace(/[_]/g, ' ')}
            </Zone>
            {
                props.regulatorySubZones ? props.regulatorySubZones.map((subZone, index) => {
                    return (
                        <RegulatoryZoneSelectedSubZone
                            subZone={subZone}
                            key={index}
                            isReadyToShowRegulatoryZones={props.isReadyToShowRegulatoryZones}
                            callRemoveRegulatoryZoneFromMySelection={props.callRemoveRegulatoryZoneFromMySelection}
                            callShowRegulatoryZone={props.callShowRegulatoryZone}
                            callHideRegulatoryZone={props.callHideRegulatoryZone}
                            isShowOnInit={props.showedLayers
                                .filter(layer => layer.type === LayersEnum.REGULATORY)
                                .some(layer =>
                                    layer.zone.layerName === subZone.layerName &&
                                    layer.zone.zone === subZone.zone)}
                        />
                    )
                }) : null
            }
        </Row>
    )}

const Zone = styled.span`
  width: 100%;
  display: block;
  line-height: 2.7em;
  text-transform: uppercase;
  font-size: smaller;
  padding-left: 10px;
  background: rgb(255, 255, 255, 0);
  user-select: none;
`

const Row = styled.div`
  width: 100%;
  display: block;
`

export default RegulatoryZoneSelectedItem
