import React, {useEffect, useState} from "react";
import styled from "styled-components";

const RegulatoryZoneSelectionItem = props => {
    const [globalIsSelected, setGlobalIsSelected] = useState(undefined);

    const select = subZone => {
        if (!subZone) {
            if(!globalIsSelected) {
                props.toggleSelectRegulatoryZone(props.regulatoryZoneName, props.regulatorySubZones.filter(subZone => {
                    return props.regulatoryZonesSelection[props.regulatoryZoneName] ? !props.regulatoryZonesSelection[props.regulatoryZoneName].some(selectedSubZone => selectedSubZone.zone === subZone.zone) : true
                }))
            } else {
                props.toggleSelectRegulatoryZone(props.regulatoryZoneName, props.regulatorySubZones)
            }
            setGlobalIsSelected(!globalIsSelected)
        } else {
            props.toggleSelectRegulatoryZone(props.regulatoryZoneName, [subZone])
        }
    }

    useEffect(() => {
        setGlobalIsSelected(props.regulatoryZonesSelection[props.regulatoryZoneName] ? props.regulatoryZonesSelection[props.regulatoryZoneName].length === props.regulatorySubZones.length : false)
    }, [props.regulatoryZonesSelection])

    const isSelected = (regulatoryZone, subZone) => {
        return regulatoryZone ? regulatoryZone.some(regulatoryZone => regulatoryZone.zone === subZone.zone) : false
    }

    return (<Row>
        <Zone selected={globalIsSelected} onClick={() => select()}>
            {props.regulatoryZoneName.replace(/[_]/g, ' ')}
        </Zone>
        {
            props.regulatorySubZones ? props.regulatorySubZones.map((subZone, index) => {
                return (<SubZone
                    onClick={() => select(subZone)}
                    selected={globalIsSelected || (!globalIsSelected && isSelected(props.regulatoryZonesSelection[props.regulatoryZoneName], subZone))}
                    key={index}>
                    <Rectangle /> {subZone.zone}
                </SubZone>)
            }) : null
        }
            </Row>)
}

const Rectangle = styled.div`
  width: 8px;
  height: 8px;
  background: gray;
  border: 1px solid white;
  display: inline-block;
  margin-right: 5px;
`

const Zone = styled.span`
  user-select: none;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  padding-right: 10px;
  display: block;
  line-height: 2.7em;
  text-transform: uppercase;
  font-size: smaller;
  padding-left: 10px;
  background: ${props => props.selected ? 'rgb(255, 255, 255, 0.3)' : 'rgb(255, 255, 255, 0)'};
`

const SubZone = styled.span`
  user-select: none;
  display: block;
  line-height: 1.9em;
  font-size: smaller;
  padding-left: 10px;
  padding-right: 10px;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  background: ${props => props.selected ? 'rgb(255, 255, 255, 0.3)' : 'rgb(255, 255, 255, 0.1)'};
  border-top: 1px solid rgb(255, 255, 255, 0.1)
`

const Row = styled.div`
  width: 100%;
  display: block;
`

export default RegulatoryZoneSelectionItem
