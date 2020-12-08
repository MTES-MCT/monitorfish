import React, {useEffect, useState} from "react";
import styled from "styled-components";

const RegulatoryZoneSelectionItem = props => {
    const [isSelected, setIsSelected] = useState(undefined);

    useEffect(() => {
        setIsSelected(props.isSelected)
    }, [props.isSelected])

    const select = () => {
        setIsSelected(!isSelected)
        props.toggleSelectRegulatoryZone(props.layerName)
    }

    return (<Row className={``} showLayer={isSelected} onClick={() => select()}>
                {props.layerName.replace('_', ' ')}
            </Row>)
}

const Row = styled.span`
  width: 100%;
  display: block;
  line-height: 1.9em;
  padding-left: 10px;
  background: ${props => props.showLayer ? 'rgb(255, 255, 255, 0.3)' : 'rgb(255, 255, 255, 0)'};
`

export default RegulatoryZoneSelectionItem
