import React, {useEffect, useState} from "react";
import styled from 'styled-components';
import {COLORS} from "../../constants/constants";
import {getHash} from "../../utils";
import {getGearCategory} from "../../domain/use_cases/showLayer";
import {getVectorLayerStyle} from "../../layers/styles/vectorLayerStyles";
import Layers from "../../domain/entities/layers";

const LayerDetailsBox = props => {
    const [vectorLayerStyle, setVectorLayerStyle] = useState(null)

    useEffect(() => {
        if(props.regulatory && props.regulatory.getProperties().zones && props.regulatory.getProperties().layer_name && props.regulatory.getProperties().engins && props.gears) {
            let hash = getHash(`${props.regulatory.getProperties().layer_name}:${props.regulatory.getProperties().zones}`)
            let gearCategory = getGearCategory(props.regulatory.getProperties().engins, props.gears);
            setVectorLayerStyle(getVectorLayerStyle(Layers.REGULATORY.code)(null, hash, gearCategory))
        }
    }, [props.regulatory, props.gears])

    return (<Details>
        {
            props.regulatory ? <>
                <Rectangle vectorLayerStyle={vectorLayerStyle} />
                <Text>
                    {props.regulatory.getProperties().layer_name.replace(/[_]/g, ' ')}
                    {
                        props.regulatory.getProperties().zones ?
                            <ZoneName>{props.regulatory.getProperties().zones.replace(/[_]/g, ' ')}</ZoneName> : null
                    }
                </Text>
            </> : null
        }
    </Details>)
}

const Rectangle = styled.div`
  width: 14px;
  height: 14px;
  background: ${props => props.vectorLayerStyle && props.vectorLayerStyle.getFill() ? props.vectorLayerStyle.getFill().getColor() : COLORS.gray};
  border: 1px solid ${props => props.vectorLayerStyle && props.vectorLayerStyle.getStroke() ? props.vectorLayerStyle.getStroke().getColor() : COLORS.grayDarkerTwo};
  margin-right: 7px;
  margin-top: 5px;
`

const Text = styled.span`
  vertical-align: text-bottom;
  margin-top: 3px;
`

const Details = styled.span`
  position: absolute;
  bottom: 10px;
  left: 380px;
  display: flex;
  margin: 1px;
  padding: 0 10px 4px 10px;
  text-decoration: none;
  text-align: center;
  height: 21px;
  border: none;
  border-radius: 2px;
  background: ${COLORS.grayBackground};
  font-size: 13px;
  font-weight: 500;
  color: ${COLORS.grayDarkerThree}
`

const ZoneName = styled.span`
  font-weight: 400;
  color: ${COLORS.grayDarkerTwo}
  font-size: 13px;
  margin-left: 10px;
`

export default LayerDetailsBox
